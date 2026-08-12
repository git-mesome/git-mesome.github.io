---
title: "Missing Payment Records and False Failure Confirmation on CB Fallback - Separating Retry Targets with a REQUESTED State"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8 months)"
role: "Payment Server design and implementation (DDD + Hexagonal Architecture)"
techStack: ["Java 21", "Spring Boot", "Resilience4j(CircuitBreaker)", "Spring Data JPA", "PostgreSQL"]
order: 4
type: "troubleshooting"
summary:
  [
    "Found a gap where Payment/Refund records were never written to the DB when a CB fallback exception occurred, and closed it by pre-saving a REQUESTED state and separating final-state confirmation by failure cause, making the records re-queryable",
  ]
---

## Symptom

After applying CircuitBreaker to the PG, ticketing, and reservation-cancellation adapters, and excluding PG confirm/cancel from the Outbox retry targets, there were cases where a CB fallback exception left no Payment/Refund record in the DB at all. This could produce a state where "the PG actually processed it, but our side has no record," with no row to even re-query against.

## Cause

Outbox retry targets were split based on idempotency. Ticket issuance (duplicate check keyed on reservationId) and reservation cancellation (idempotent DELETE) were included as retry targets, but PG confirm/cancel was excluded because it's a non-idempotent operation involving money, carrying the risk of duplicate approval or duplicate cancellation on retry. Excluding it was the right call on its own, but the side effect was missed: if the PG call ended in an exception, the structure left no record in the DB whatsoever.

## Alternatives Considered

We decided to pre-save Payment/Refund as REQUESTED before the PG call, leaving a minimal record. We also considered building out a settlement batch and a notification queue, but judged that to be overkill for the current traffic and operational scale, and excluded it from scope.

During implementation, we first tried confirming every failure as FAILED, but found this was actually dangerous. An external call failure (e.g., timeout) could mean the PG had actually processed the payment, but confirming it as FAILED would cancel the reservation, and any subsequent retry confirm would be blocked by `Payment.approve()`, making recovery impossible.

## Action

We split handling by failure cause. CircuitBreaker OPEN (the request never reaches the PG at all) is safely confirmed as FAILED, while external call failures (where whether the PG processed it is uncertain) are kept as REQUESTED, left only as a target for re-querying and retry.

![CB fallback failure cause branching diagram - when a PG call fails, the cause branches: CircuitBreaker OPEN (request never reached the PG) is confirmed as FAILED (reservation cancelled), while an external call failure (PG processing status uncertain) is kept as REQUESTED (target for re-query/retry)](../../../assets/portfolio/next-frame/payment/cb-fallback-decision.svg)
*CB fallback failure cause branching - CircuitBreaker OPEN becomes FAILED, external call failures are kept as REQUESTED*

We also discovered a race condition in concurrent confirm requests during implementation — see the [separate troubleshooting document](/portfolio/next-frame-payment-confirm-race) for the cause and fix.

![confirmPayment flow diagram - REQUESTED is pre-saved before the PG call, then confirmPayment is called on the PG via CircuitBreaker; on a successful response, applyConfirmResult runs, publishing a PaymentApprovedEvent and then the Outbox (ticket issuance, reservation cancellation). CB OPEN ends with a final FAILED state, while an external call failure keeps it as REQUESTED (a re-query target)](../../../assets/portfolio/next-frame/payment/confirm-flow.svg)
*confirmPayment flow - REQUESTED pre-save followed by the PG call, with final-state branching by failure cause*

## Result

Even when a PG call ends in an exception, a minimal REQUESTED/FAILED record is now always left behind, making re-querying possible, and separating final-state confirmation by failure cause prevents the false positive of "it actually succeeded but was treated as a failure." (See the [Payment Server project document](/portfolio/next-frame-payment) for the design background.)
</content>
