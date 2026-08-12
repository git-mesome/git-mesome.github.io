---
title: "Outbox 저장 누락 - AFTER_COMMIT 트랜잭션 경계 문제"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8개월)"
role: "Payment Server 설계·구현 (DDD + 헥사고날 아키텍처)"
techStack: ["Java 21", "Spring Boot", "Spring Data JPA", "PostgreSQL", "Outbox Pattern"]
order: 3
type: "troubleshooting"
summary:
  [
    "AFTER_COMMIT 리스너가 원본 트랜잭션 커밋 이후 실행되는 특성 때문에 별도 트랜잭션 없이는 Outbox 저장 자체가 반영되지 않는 함정을 Outbox 도입 과정에서 발견·수정",
  ]
---

## 현상

결제 승인 시 `PaymentEventHandler`가 결제 트랜잭션 안에서 `ticketingClient.issueTicket()`을 동기 직접 호출하던 구조였습니다. 이 외부 호출을 트랜잭션 밖으로 분리하기 위해 `AFTER_COMMIT` 리스너 + Outbox 패턴으로 바꾸는 작업을 하던 중, 결제 커밋 직후 Outbox 테이블에 레코드가 남아야 할 상황에서 저장 자체가 반영되지 않는 현상을 만났습니다.

## 원인 파악 과정

Outbox insert 로직 자체는 정상적으로 호출되고 있었기 때문에, upsert 직후 바로 재조회해서 row 존재 여부를 확인하는 임시 로그(`log.info("AFTER UPSERT present={}", jpaTicketIssueOutboxRepository.findByReservationId(reservationId).isPresent())`)를 심어봤습니다. 재조회 결과가 매번 비어 있는 걸 확인하고, "저장 호출은 되는데 커밋이 안 되고 있다"는 방향으로 원인을 좁혔습니다.

## 원인

Outbox 기록을 `AFTER_COMMIT` 트랜잭션 리스너에서 처리했는데, 이 리스너는 원본 트랜잭션이 커밋된 이후 실행됩니다. 리스너 안에서 실행되는 저장 작업에 활성 트랜잭션이 없어 커밋되지 않았고, Outbox 저장이 조용히 사라졌습니다.

## 조치

Outbox 저장 로직을 `REQUIRES_NEW`로 별도 트랜잭션을 열어 처리하도록 분리했습니다. 원본 결제 트랜잭션의 성공 여부와 무관하게 Outbox 기록 자체는 독립적으로 커밋됩니다.

## 결과

결제 커밋 후 Outbox 레코드가 안정적으로 남아, 스케줄러의 지수 백오프 재시도(5s→30s→2m→10m, 4회 실패 시 FAILED)가 정상 동작하게 됐습니다. (설계 배경은 [Payment Server 프로젝트 문서](/portfolio/next-frame-payment) 참고)
