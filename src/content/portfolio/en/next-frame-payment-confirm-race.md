---
title: "Payment Confirm Concurrent Request Race Condition - reservationId Unique Constraint Violation"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8 months)"
role: "Payment Server design & implementation (DDD + Hexagonal Architecture)"
techStack: ["Java 21", "Spring Boot", "Spring Data JPA", "PostgreSQL"]
order: 5
type: "troubleshooting"
summary:
  [
    "Found and fixed a race condition where two concurrent confirm requests both saw an empty result at lookup time and each attempted to save, causing a reservationId unique constraint violation",
  ]
---

## Symptom

When a payment confirm request came in twice within a short time window, a `reservationId` unique constraint violation error occurred intermittently.

## Cause

The confirm process first checked for an existing record via `findByReservationId` and saved only if none was found. This was a check-then-act race condition: when two requests arrived at the same time, both saw "no record" at the lookup point and each attempted to save.

## Action

When a unique constraint violation occurred on save, it was caught as an exception case, and the winning row that had already been saved successfully was re-fetched and returned. The transaction boundaries were also separated so that a transaction whose re-fetch failed (rolled back) would not be reused as-is.

## Result

Even when concurrent confirm requests come in, they now converge on a single approval result and return a consistent response to the client. (See the [Payment Server project document](/portfolio/next-frame-payment) for design background.)
