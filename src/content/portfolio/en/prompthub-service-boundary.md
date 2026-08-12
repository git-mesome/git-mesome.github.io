---
title: "Why the Service Boundary Broke Down - A Structure Where Internal gRPC Assembled Screen Data"
company: "AI Agent Marketplace"
period: "2026.06 - 2026.07 (2 months)"
role: "Team Lead & PO, Inter-service Communication Boundary Design"
techStack: ["gRPC", "REST API", "Kafka", "MSA"]
order: 6
type: "project"
summary:
  [
    "Discovered a tightly coupled structure where services pulled and assembled each other's data via internal gRPC; pressed AI for the reasoning behind its conclusion, confirmed it was a hallucination, validated with external practitioners, and moved screen composition to the frontend",
    "Judged BFF to be the right direction but shelved it due to infrastructure resource constraints - documented afterward, distinguishing the principled judgment from the resource constraint",
  ]
---
## Background

- Although services were separated via MSA, the initial design was based on the premise that "the backend fully loads and delivers all data needed for the screen," rather than "each service is responsible only for its own data."
- To fill a single screen, the default structure became one where the service responsible for that screen called the other services via internal gRPC, assembled the data on the backend, and returned it to the frontend as a single response.

## Outcomes

- Verified, by repeatedly probing for the reasoning, that the architectural conclusion AI confidently and repeatedly gave - that "binding services together via internal gRPC as it currently stands is appropriate" - was in fact an unfounded rationalization (hallucination).
- Did not stop at AI verification alone; showed the actual structure to two external practitioners and gathered their feedback.
- Based on that outcome, removed the screen-composition logic that had been coupled via internal gRPC and switched to a structure where the frontend directly calls and combines multiple public REST APIs, lowering the coupling between services.

## Design and Implementation

**1. Discovery - AI Verification Failure**

- While reviewing the design repeatedly during consideration of introducing a BFF (Backend for Frontend), kept asking AI for direction.
- AI gave the same conclusion every time: that "binding things together via internal communication (gRPC) as it currently stands is appropriate."
- When pressed on what reasoning led to that conclusion, the justification fell apart - it wasn't a conclusion backed by real grounds, but closer to a plausible-sounding rationalization.

**2. Practitioner Validation**

- Judging that AI confirmation alone wasn't enough, showed the design structure directly to two external practitioners and asked for their opinion.
- Both pointed out that it was a flawed implementation - their assessment was that if the coupling between services was this high, it would be better to go monolithic instead.

**3. Action and Constraints**

- Judged that a BFF itself was the right direction and attempted to introduce one after studying it, but there wasn't enough memory headroom on the development server to run one more module.
  - The reason the BFF wasn't introduced into the code was a memory resource constraint, not a principled judgment that weighed coupling, traffic, and cost.
- Instead, removed the screen-composition logic that had been coupled via internal gRPC and switched to a structure where the frontend directly calls and combines the public REST APIs of multiple services.
- Current principle: internal batch-style lookups of data owned by a service (e.g., the path where settlement pulls order's settlement source lines) keep using gRPC; data for screen composition uses public REST + frontend composition.

![Inter-service communication boundary Before/After comparison diagram - Before: Frontend calls the service responsible for the screen, and that service calls services B and C via internal gRPC to assemble data on the backend. After: Frontend directly calls the public REST APIs of services A, B, and C respectively and combines them, with no direct coupling between services](../../../assets/portfolio/prompthub/service-boundary/before-after.svg)
*Inter-service communication boundary Before/After - transition from internal gRPC composition to frontend REST composition*

**4. Root Cause - Not a Technology Choice, but the Absence of Design Artifacts**

- The common cause of the coupling explosion wasn't gRPC versus REST, but also the absence of cross-domain design discussions and their resulting artifacts.
- The initial internal communication spec between services wasn't decided in meetings but was requested and implemented ad hoc as each side needed; relationships between services weren't drawn as diagrams, and reliance on AI implementation meant no one was left who could grasp the coupling structure.

**5. Operations and Retrospective - Anti-patterns Encountered**

I think we experienced nearly every problem a team faces when adopting MSA without studying it enough.

1. Locked in gRPC routing first, then switched entirely to REST mid-development - had to handle frontend changes, new backend APIs, and removal of existing gRPC all at once.
2. Replicated data owned by other services as tables in our own schema, rendering service boundaries meaningless.
3. Fixated on preventing event loss and only thought in terms of "re-fetching via gRPC on loss" - an idea inconsistent with the Kafka principle that the receiving side processes at its own pace, even though we were using Kafka.
4. Didn't factor computing resources (server memory) into module design, which later required an ad hoc workaround (merging modules) unrelated to principle due to resource shortage - the failed BFF introduction is a recurrence of this problem.
5. Even after recognizing the problem, kept only asking AI and didn't share it with the team - if we hadn't pushed through to practitioner validation, this coupling problem would have kept being left unaddressed.

Conclusion: AI's architectural advice is only verified by pressing for its reasoning, and if confidence still isn't there, it needs to go through practitioners and team discussion. Since this incident, this procedure (verify reasoning → validate with practitioners/team if needed) has always been applied to architectural proposals AI makes, and it's still maintained today.

**6. Trade-off - Burden Shifted to the Frontend**

- Without a BFF or caching layer, as the frontend directly calls and combines multiple APIs, the burden of managing different failure policies per API fell on the frontend.
- This also brought the burden of having the ordering/composition (waterfall) logic for multiple calls live in frontend code rather than the backend.
