---
title: "결제 confirm 동시 요청 경합 조건 - reservationId unique 제약 위반"
company: "NextFrame (WiSoft)"
period: "2025.05 - 2025.12 (8개월)"
role: "Payment Server 설계·구현 (DDD + 헥사고날 아키텍처)"
techStack: ["Java 21", "Spring Boot", "Spring Data JPA", "PostgreSQL"]
order: 5
type: "troubleshooting"
summary:
  [
    "동시 confirm 요청 두 개가 조회 시점엔 함께 빈 결과를 보고 각자 저장을 시도해 reservationId unique 제약 위반이 발생하는 경합 조건을 발견·수정",
  ]
---

## 현상

결제 confirm 요청이 짧은 시간 안에 두 번 들어오면 간헐적으로 `reservationId` unique 제약 위반 에러가 발생했습니다.

## 원인

confirm 처리가 `findByReservationId`로 기존 레코드가 있는지 조회한 뒤 없으면 저장하는 순서였는데, 두 요청이 동시에 조회 시점에 둘 다 "레코드 없음"을 보고 각자 저장을 시도하는 경합 조건(check-then-act)이었습니다.

## 조치

저장 시 unique 제약 위반이 나면 이를 예외 케이스로 잡아, 이미 저장에 성공한 승자 row를 재조회해 반환하도록 처리했습니다. 재조회가 실패(rollback)한 트랜잭션을 그대로 재사용하지 않도록 트랜잭션 경계도 분리했습니다.

## 결과

동시 confirm 요청이 들어와도 하나의 승인 결과로 수렴해 클라이언트에 일관된 응답을 반환하게 됐습니다. (설계 배경은 [Payment Server 프로젝트 문서](/portfolio/next-frame-payment) 참고)
