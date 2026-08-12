---
title: "DB Connection Pool Occupancy Issue - Coupling PG Calls with Transactions"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8 months)"
role: "Payment Server design & implementation (DDD + Hexagonal Architecture)"
techStack: ["Java 21", "Spring Boot", "Spring Data JPA", "PostgreSQL"]
order: 2
type: "troubleshooting"
summary:
  [
    "Discovered a structural issue where external PG calls and DB writes were bound into a single transaction, holding a DB connection for up to 8 seconds; resolved it by redesigning PaymentService as a pure orchestrator",
  ]
---

## Symptom

In the payment approval flow, the external PG API call and the DB write logic were bound within a single transaction scope. Based on `HttpPaymentGatewayAdapter`'s `connectTimeout 3s + readTimeout 5s`, a slow PG response could hold a single DB connection for up to 8 seconds.

## Cause

Because the PG call and the DB write were executed sequentially inside the same `@Transactional` method, the connection couldn't be returned to the pool while waiting for the PG response. Under heavy traffic, this structure could lead to connection pool exhaustion.

## Alternatives Considered

I first considered moving the PG call outside the transactional method, but that risked an inconsistency where "the PG approval succeeds but the DB write fails." I also considered a compensating transaction that would cancel the PG payment if the DB write failed after PG approval, but the PG cancellation itself could also fail, and nesting compensation logic would only add complexity — so I rejected this approach.

## Action

I established the principle "external calls happen outside the transaction, DB work stays in a minimal-scope transaction" and redesigned `PaymentService` as a pure orchestrator. I removed `@Transactional` from it and delegated DB work to `PaymentTransactionService`/`RefundTransactionService`.

![DB connection occupancy issue Before/After comparison diagram - Before: transaction start → PG call (up to 8s wait) → DB write → transaction commit all bound within a single transaction scope, holding the connection even while waiting for the PG response. After: the PG call is handled outside the transaction boundary, and only PaymentTransactionService is isolated in a minimal-scope transaction](../../../assets/portfolio/next-frame/payment/db-connection-pool-before-after.svg)
*DB connection occupancy Before/After - separating the PG call from the transaction boundary*

## Result

The connection is no longer held while waiting for the PG response, and the rollback scope on write failure is now clearly defined. (See the [Payment Server project doc](/portfolio/next-frame-payment) for design background)
</content>
