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
    "AFTER_COMMIT 리스너가 원본 트랜잭션 커밋 이후 실행되는 특성 때문에 별도 트랜잭션 없이는 Outbox 저장 자체가 반영되지 않는 버그를 발견·수정",
  ]
---

## 현상

결제 승인 후 티켓 발급·예약 상태 변경 같은 후속 작업을 Outbox 패턴으로 안전하게 재시도하도록 구현했는데, 결제 커밋 직후 Outbox 테이블에 레코드가 남아야 할 상황에서 저장 자체가 반영되지 않는 현상이 나타났습니다.

## 원인

Outbox 기록을 `AFTER_COMMIT` 트랜잭션 리스너에서 처리했는데, 이 리스너는 원본 트랜잭션이 커밋된 이후 실행됩니다. 리스너 안에서 실행되는 저장 작업에 활성 트랜잭션이 없어 커밋되지 않았고, Outbox 저장이 조용히 사라졌습니다.

## 조치

Outbox 저장 로직을 `REQUIRES_NEW`로 별도 트랜잭션을 열어 처리하도록 분리했습니다. 원본 결제 트랜잭션의 성공 여부와 무관하게 Outbox 기록 자체는 독립적으로 커밋됩니다.

## 결과

결제 커밋 후 Outbox 레코드가 안정적으로 남아, 스케줄러의 지수 백오프 재시도(5s→30s→2m→10m, 4회 실패 시 FAILED)가 정상 동작하게 됐습니다. (설계 배경은 [Payment Server 프로젝트 문서](/portfolio/next-frame-payment) 참고)
