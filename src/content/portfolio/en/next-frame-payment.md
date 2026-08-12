---
title: "Live Performance Ticketing Payment Service"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8 months)"
role: "Payment Server design & implementation (DDD + Hexagonal Architecture)"
techStack:
  [
    "Java 21",
    "Spring Boot",
    "Spring Data JPA",
    "PostgreSQL",
    "Resilience4j(CircuitBreaker)",
    "DDD",
    "Hexagonal Architecture",
    "Outbox Pattern",
    "Toss Payments",
  ]
order: 1
type: "project"
summary:
  [
    "Separated external PG calls from DB transactions, eliminating DB connection occupation that lasted up to 8 seconds during PG response delays",
    "Resolved the risk of losing post-payment tasks (ticket issuance, reservation status changes) with a DB-based Outbox pattern, stabilized with exponential backoff retries",
    "Converted to a structure where minimal state records remain and can be re-queried even when a PG call fails with an exception",
    "Documented 4 transaction boundary, concurrency, and failure-handling issues discovered during implementation as separate troubleshooting write-ups",
  ]
---

## Background

I designed and implemented the Payment Server, based on DDD and Hexagonal Architecture, for a ticketing platform that reserves live performance seats in real time and issues QR tickets. Since payment is a domain where money changes hands, I had to establish principles from the early design stage for transaction boundaries, handling external service failures, and preventing inconsistencies on retry.

## Results

- Separated external PG calls from DB transactions, eliminating DB connection occupation that lasted up to 8 seconds during PG response delays
- Resolved the risk of losing post-payment tasks (ticket issuance, reservation status changes) with a DB-based Outbox pattern, stabilized with exponential backoff retries
- Converted to a structure where minimal state records remain and can be re-queried even when a PG call fails with an exception
- Documented 4 transaction boundary, concurrency, and failure-handling issues discovered during implementation as separate troubleshooting write-ups

## Design & Implementation

Since payment is a domain where money changes hands, the problems I encountered during implementation ultimately converged on a single principle - **handle external calls outside the transaction, and treat failures differently depending on whether they can be definitively confirmed or not.**

![Failure-handling principle flowchart - external calls (PG, ticketing, reservation cancellation) are separated outside the transaction, while DB work is handled in a minimal-scope transaction. When a failure occurs, branch on whether it can be confirmed as definite - if confirmable, like a CB OPEN or idempotent operation, mark it FAILED and register a retry; if PG processing status is uncertain, keep it as REQUESTED (subject to re-query)](../../../assets/portfolio/next-frame/payment/failure-handling-principle.svg)
*Failure-handling principle - branching into FAILED/REQUESTED depending on whether the failure can be confirmed*

The specific problems and judgment process encountered during implementation are documented as troubleshooting write-ups.

- [DB connection occupation problem](/portfolio/next-frame-db-connection-pool) — a structural issue where PG calls and DB transactions were bundled together, occupying connections for up to 8 seconds
- [Missing Outbox records](/portfolio/next-frame-outbox-atomicity) — an `AFTER_COMMIT` transaction boundary bug that caused Outbox records to not be persisted
- [Missing records and false-positive failure confirmation on CB fallback](/portfolio/next-frame-cb-fallback-gap) — separating retry targets by idempotency criteria and introducing the REQUESTED state
- [Race condition on concurrent confirm requests](/portfolio/next-frame-payment-confirm-race) — a race condition violating the reservationId unique constraint

**Background for adopting the Outbox pattern**

Handling post-payment tasks (ticket issuance, reservation status changes) with simple retries had limits. Retry state was lost on app restart, and publishing events before the transaction commit meant that if the commit failed, the already-published events could not be rolled back. I viewed this as an at-least-once delivery problem inherent to distributed systems and adopted the transactional Outbox pattern. I also considered introducing Kafka, but judged it to be over-engineering given the team size and infrastructure level, and settled on a DB-based Outbox instead.

To verify whether this structure was truly necessary, I experimented with removing the Outbox and simplifying to a synchronous flow (immediately canceling the PG payment if ticket issuance failed). However, I confirmed that PG cancellation is also an external API call that can fail, which could lead to an even worse inconsistency - "payment succeeded, but no ticket and no refund." I reverted to the Outbox, directly verifying the structure's necessity, and settled on a design where the payment commit records to the Outbox in `AFTER_COMMIT`, a scheduler retries with exponential backoff at 5s → 30s → 2m → 10m intervals, and after 4 failures, the state transitions to FAILED.

**Operations & Retrospective**

I deliberately excluded settlement batching, a notification queue, and a re-query scheduler from this scope. Keeping minimal records alone provides the basis for re-querying, and I judged that automated settlement would be over-spec for the current traffic and operational scale.
