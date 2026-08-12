---
title: "Authentication/Authorization Architecture - Canceling auth-service Separation and Centralizing Forward-Auth"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "Authentication/Authorization (Spring Cloud Gateway) design and implementation"
techStack: ["Spring Cloud Gateway", "Spring Boot", "Redis", "JWT (RS256)", "MSA"]
order: 1
type: "project"
summary:
  [
    "Before implementation began, design validation overturned the plan to physically separate auth-service and shifted to centralized authorization via gateway forward-auth",
    "Eliminated up to 15 minutes of staleness in the role claim, and made logout session invalidation take effect from the very next request without waiting for AT expiration (epoch comparison, fail-closed)",
  ]
---
## Background

I was responsible for the authentication/authorization architecture at [AI Agent Marketplace](/portfolio/prompthub-overview). The initial design was to physically separate auth-service, coupling it with user-service via gRPC at login time, while gateway would stateless-verify the JWT for authorization and reinforce it with a Redis blacklist for real-time blocking. During the design validation stage before implementation began, grounds emerged to overturn both of these decisions at once, so the following four items were redesigned.

**Principles**

- Gateway holds no state and is only responsible for signature verification and routing.
- user-service fully owns all authentication/authorization data and the decisions made on it.


| Initial plan | Adopted plan |
| ---------------------------------- | -------------------------------------- |
| Physical auth-service separation + gRPC coupling at login | [1. Not building a separate auth-service](#1-not-building-a-separate-auth-service) |
| role snapshot claim / RT held solely in Redis | [2. Tokens - claim holds only sub+epoch, RT source of truth in RDB + Redis cache](#2-tokens---claim-holds-only-subepoch-rt-source-of-truth-in-rdb--redis-cache) |
| gateway directly references Redis | [3. Authorization - centralized via forward-auth](#3-authorization---centralized-via-forward-auth) |
| Session revocation attached at every controller entry point | [4. Session revocation - anchored at state transition points](#4-session-revocation---anchored-at-state-transition-points) |


## Results


| Metric | Before | After |
| ------------------ | ------------------ | ------------------------------------- |
| Delay in role/status propagation | Up to 15 minutes (snapshot at issuance time) | Looked up in real time on every request |
| Window in which a token remained valid after logout | Up to 15 minutes (until AT expiration) | Invalidated immediately from the next request (epoch comparison, fail-closed) |
| Upper bound on delay for suspension/withdrawal/promotion propagation | Undefined | Immediate (explicit evict), 60 seconds worst case |


A security flaw in the Kakao login flow itself was also found and fixed during the same validation process - see the [separate troubleshooting document](/portfolio/prompthub-oauth-vulnerability) for details.

## Design and Implementation

### 1. Not building a separate auth-service

- **Problem**: The dev server didn't have enough memory headroom to run one more JVM process, and around the same time the team also settled on the policy that "domain services should run pure business logic with no authorization code." The original design (auth-service separation + gRPC coupling at login) conflicted with both conditions, and since User creation and Auth linkage would need to span two services, it also carried the partial-failure risk of a distributed transaction, where a failure on one side alone could leave an account completed on neither side.
- **Decision**: Switched to a setup where user-service fully owns both authentication (Kakao login, reissuance, logout) and authorization data, eliminating the distributed partial-failure problem entirely.
- **Trade-off**: user-service becomes a synchronous dependency point for all authentication traffic - during a restart, not just login/reissuance but every other domain service API that requires authentication stops as well. This was an acceptable trade-off for a single instance in the dev environment, but multiple instances become a hard requirement when moving to production.

![Comparison diagram of the auth-service placement decision - Rejected plan: Client→Gateway (stateless JWT verification)→domain services, with auth-service coupled to user-service via gRPC at login. Adopted plan: Client→Gateway (forward-auth)→user-service (unified ownership of authentication and authorization)→domain services](../../../assets/portfolio/prompthub/auth-gateway/auth-service-decision.png)
*Comparison of the rejected auth-service separation plan versus the adopted forward-auth plan*

### 2. Tokens - claim holds only sub+epoch, RT source of truth in RDB + Redis cache

- **Problem**: Embedding the role claim as a snapshot taken at issuance time meant it wouldn't refresh for up to the AT TTL (15 minutes), so state changes such as a seller promotion were reflected late.
- **Decision**: Values that need freshness, like role and status, are no longer placed in the token - forward-auth reads them from the source of truth on every request instead. The claim was reduced to just sub (uuid) and epoch (session version, incremented by 1 on every RT reissuance) - since epoch only points to the session's sequence number, unlike role/status it has no staleness problem.

**Comparison of RT storage alternatives**


| Alternative | Risk |
| ---------------------- | ---------------------------------------------------------------- |
| Redis-only storage | If Redis is lost, all active users are forced to re-login at once, a "login stampede" that collapses the entire auth path |
| RDB source of truth + Redis cache (adopted) | RDB is updated first on rotation, and if the two stores diverge RDB wins - reissuance keeps working off RDB even if Redis goes down |


The judgment criterion was set not as "the current scale, running on a single EC2 instance," but as "a production scale where each component's failure domain is independent."

- **Additionally introduced**: Added RTR (Refresh Token Rotation), which replaces the RT on every reissuance, along with reuse detection.

### 3. Authorization - centralized via forward-auth

Forward-auth is a scheme in which gateway delegates the authorization decision to user-service for confirmation before routing a request.

**Alternatives considered**


| Alternative | Reason for rejection |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| gateway reads Redis directly to judge role/blacklist | This pattern pays off when traffic volume is large enough that blocking at the edge yields a big benefit, but at our scale that benefit is outweighed by the operational cost of gateway depending on a state store |
| Per-service authorization filter (security-starter module) | Configuration and implementation are duplicated across services, and a missing filter directly becomes a blocking gap |


The pattern of gateway holding a Redis blacklist directly and blocking at the edge is itself a common choice in practice. However, that pattern pays off when traffic volume is large enough that edge-blocking meaningfully reduces the requests reaching domain services - and given that this was a team project running on a single dev-server instance, I judged that the operational cost of gateway depending on a state store (Redis) and thereby expanding the failure domain outweighed that benefit. So I chose to consistently apply the principle of keeping all authorization-related state in the auth domain (user-service).

- **Decision**: gateway only performs JWT signature verification (public key), then extracts uuid+epoch and calls user-service's internal API `authorize(userId, epoch)`. An epoch mismatch returns 401 (fail-closed), status≠ACTIVE is rejected, and role is checked by gateway against its own policy table.
- **Rationale for the details**: The policy table (path → required role) was externalized via `@ConfigurationProperties`, but the `/admin/**` → ADMIN catch-all alone was fixed as a hardcoded default in code rather than configuration - to prevent the most critical protection line from silently disappearing due to a config file error. If policy table parsing fails, startup itself is aborted fail-fast.
- **Failure handling**: authorize responses are cached with a 60-second TTL (invalidated immediately on state change), and on Redis failure it falls back to a direct DB lookup - since authorization can't be allowed to fail open, the only degradation permitted is slower response times.

![authorize sequence diagram - Client sends a request to Gateway, which verifies the JWT signature and extracts uuid+epoch, then calls user-service's authorize; on epoch mismatch returns 401, if status is not ACTIVE returns 403, and once the policy table/role check passes it injects X-User-Id and routes the request](../../../assets/portfolio/prompthub/auth-gateway/authorize-flow.png)
![Token/session lifecycle diagram - epoch-based RTR: at login, AT+RT are issued with epoch=1; after AT expiry, a refresh rotates epoch 1→2 via RTR; if a leaked older RT is replayed, the mismatch against the value stored in RDB is detected and the entire session is invalidated with 401 REUSE_DETECTED; logout only deletes the RT, which induces an epoch comparison failure starting from the next request for immediate invalidation](../../../assets/portfolio/prompthub/auth-gateway/token-sesson-lc.png)

*Left: authorize request sequence · Right: epoch-based RTR token/session lifecycle*



### 4. Session revocation - anchored at state transition points

- **Problem**: The question was where to attach RT deletion and authorize cache invalidation upon suspension/withdrawal. Attaching it at every controller entry point would leave a growing possibility of omission as call paths increased (admin API, future admin-service, self-initiated withdrawal, etc.).
- **Decision**: Attached this side effect not to controllers but to user-service's state-transition domain methods (e.g. `user.withdraw()`), fixing the point where state changes to a single location inside user-service regardless of who the caller is. admin-service has full read/write access to the schema and updates the same physical table directly without going through the API, so instead it explicitly evicts the same Redis cache key right after the state change to keep it immediately consistent - even if the evict fails, consistency is still guaranteed within the cache's 60-second TTL worst case.
- **Logout handling**: Deleting the RT alone is enough to take effect immediately from the next request (see the diagram above). gateway remains stateless throughout, and the epoch comparison is handled inside user-service's authorize, which already holds state - adding just one check to the existing round trip with no new network hop.
- **Limitation**: The premise is "one active session per user" - supporting multi-device login would require redesigning epoch at the session level, which I chose not to prepare for in advance and to revisit at that point instead.
