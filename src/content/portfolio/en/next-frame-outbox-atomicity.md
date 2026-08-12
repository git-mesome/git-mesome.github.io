---
title: "Outbox Save Loss - AFTER_COMMIT Transaction Boundary Issue"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8 months)"
role: "Payment Server design & implementation (DDD + Hexagonal Architecture)"
techStack: ["Java 21", "Spring Boot", "Spring Data JPA", "PostgreSQL", "Outbox Pattern"]
order: 3
type: "troubleshooting"
summary:
  [
    "Discovered and fixed a pitfall during Outbox adoption: because the AFTER_COMMIT listener runs only after the original transaction commits, the Outbox save itself was never persisted unless it ran in its own separate transaction",
  ]
---

## Symptom

On payment approval, `PaymentEventHandler` was calling `ticketingClient.issueTicket()` synchronously and directly inside the payment transaction. While reworking this to move the external call outside the transaction using an `AFTER_COMMIT` listener plus the Outbox pattern, I ran into a case where, right after the payment transaction committed, the Outbox record that should have been persisted simply wasn't there.

## Root Cause Investigation

The Outbox insert logic itself was clearly being invoked, so I added a temporary log statement that re-queried the row immediately after the upsert to check whether it existed (`log.info("AFTER UPSERT present={}", jpaTicketIssueOutboxRepository.findByReservationId(reservationId).isPresent())`). The re-query came back empty every single time, which narrowed the cause down to "the save call is happening, but it's not being committed."

## Root Cause

The Outbox write was handled inside an `AFTER_COMMIT` transaction listener, which runs only after the original transaction has already committed. The save executed inside the listener had no active transaction to commit into, so it silently disappeared and the Outbox record was never persisted.

## Action Taken

Split the Outbox save logic out into its own transaction using `REQUIRES_NEW`. Now the Outbox record commits independently, regardless of whether the original payment transaction succeeds.

## Result

Outbox records now persist reliably after the payment commits, which lets the scheduler's exponential backoff retry (5s→30s→2m→10m, marked FAILED after 4 failures) work as intended. (See the [Payment Server project doc](/portfolio/next-frame-payment) for design background.)
