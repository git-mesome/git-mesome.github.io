---
title: "산업용 IoT 반응형 스트리밍 프리로딩 구조 (RT-RSS)"
company: "Graduate Research"
period: "2023.09 - 2025.08 (석사 연구, 논문 게재 2025.09)"
role: "연구 설계 및 구현"
techStack: ["Reactive Streams", "SSE", "Webflux", "MQTT", "CQRS", "PostgreSQL", "Redis", "localStorage"]
order: 1
type: "project"
summary:
  [
    "반복 구간 조회 시 HTTP 요청 6회→1회, 평균 응답시간 75.7% 개선(32.408ms→7.875ms)",
    "부하조건 5종 스트리밍 안정성 실험에서 전 조건 누락률 0%·연결단절 0회 검증",
  ]
---

## 배경

IoT 디바이스가 초당 단위로 시계열 데이터를 지속 발행하는 산업용 환경입니다. 기존 Thread-per-Request 동기 구조는 요청당 스레드를 블로킹으로 유지해, 동시 요청이 몰리면 스레드 수 급증·컨텍스트 스위칭 오버헤드가 심화되고, 생산 속도가 소비 속도를 초과할 때 흐름 제어가 없으면 데이터 손실이나 시스템 과부하로 이어질 수 있는 구조적 한계가 있었습니다.

![RT-RSS 전체 아키텍처 다이어그램 - IoT Devices(BMS 1~n)가 MQTT/MQTTS로 MQTT Broker에 시계열 데이터를 전송하고, Real-time Data Processing Component(Data Collection Layer → Anomaly Detection Layer → Data Management Layer의 Notification/Query/Persistence Model)를 거쳐 REST API·SSE로 Dashboard에 전달, Cache/Store로 Database(Query: In-Memory Caching+Disk-based storage, Command: Disk-based storage)에 저장](../../assets/portfolio/rt-rss/architecture.png)
*RT-RSS 전체 아키텍처 - IoT 디바이스부터 대시보드까지의 데이터 흐름*

## 성과

- 반복 구간 조회(기간 변경·재탐색) 시 HTTP 요청 6회→1회, 평균 응답시간 75.7% 개선(32.408ms→7.875ms)
- 부하조건 5종(1명·1분/5분, 100명·1분/5분, 10명·1시간) 스트리밍 안정성 실험에서 전 조건 누락률 0%·연결단절 0회 (동일 조건 동기식은 100명·5분 0.033%, 10명·1시간 0.056% 누락)

## 설계 및 구현

**대안 비교 - 실시간 전송 방식**

- Long Polling - 구현은 단순하나 요청마다 연결을 재설정해 서버 부하·지연 증가
- WebSocket - 양방향 통신에 지연은 낮지만 HTTP Upgrade가 필요해 프록시·방화벽 환경에서 호환성 문제 가능
- SSE - HTTP를 그대로 써서 인프라 호환성이 높고 자동 재연결·메시지 순서 보장을 표준 기능으로 내장, 단 단방향만 지원

대시보드는 서버→클라이언트 단방향 푸시만 필요해 WebSocket의 양방향성은 불필요하다고 판단해 SSE를 채택했습니다. I/O 모델도 Thread-per-Request(단순하지만 스레드 급증)와 이벤트 루프 기반 논블로킹(적은 스레드로 확장 가능하나 이벤트 큐 누적 시 지연)을 비교해 후자를 택했고, Reactive Streams의 Backpressure로 생산자-소비자 처리 속도 차이를 명시적으로 제어했습니다.

**결정과 trade-off**

- SSE는 단방향만 지원해 클라이언트→서버 제어가 필요해지면 재설계해야 하고, HTTP/1.1에서는 다수 연결 시 연결 수 제한으로 확장성 제약이 있다는 한계를 감수했습니다.
- CQRS로 쓰기(Command Store, PostgreSQL)와 조회(Query Store, Redis 캐시와 PostgreSQL 디스크로 이원화)를 분리했습니다. 빈번 조회되는 소량 데이터는 캐시로, 특정 기간 전체처럼 대량 조회가 필요한 데이터는 디스크로 라우팅합니다.
- 캐시는 최근 5분만 유지합니다. 센서 데이터가 1초 주기라 5분이면 300개 관측치가 쌓이는데, 초기 시각화 단계에서 변동 양상·이상 징후 같은 단기 패턴을 식별하기에 충분한 양이라고 판단했습니다.
- 이상 탐지는 규칙 기반으로 설계했습니다. 도메인 전문가 경험, 산업 표준·규정의 정량 기준, 과거 운영 데이터의 통계적 패턴 세 가지를 근거로 규칙 집합을 구성했습니다. 계산이 단순해 실시간 스트리밍에 적합하고 판정 근거 추적이 쉽지만, 복잡한 패턴은 못 잡는다는 한계가 있습니다.
- 프리로딩은 2종으로 설계했습니다. 최근 데이터 우선(사용자가 최신 정보를 먼저 본다는 UX 특성 반영)과 이상탐지 기반 우선(이상 발생 시점 전후 데이터가 원인 분석에 먼저 필요하다고 판단해 해당 구간을 최우선 재정렬)입니다.

![Data Management Layer 모듈 구성 및 데이터 흐름 다이어그램 - Data Collection Layer에서 넘어온 데이터를 Anomaly Detection Layer가 정상/비정상으로 분류, 비정상은 Notification Model이 SSE로 대시보드에 푸시. 전체 스트림·비정상 데이터는 Persistence Model이 Command Store(Disk-based Storage)에 기록하고, Query Model은 프리로딩된 시계열 데이터를 Query Store(In-Memory Caching + Disk-based Storage)에서 조회](../../assets/portfolio/rt-rss/realtime-processing.png)
*실시간 데이터 처리 계층의 모듈 구성 및 데이터 흐름*

최초 접속 응답은 두 구조가 거의 같았고(12.78ms vs 12.46ms), 격차는 필터·기간을 바꿔가며 반복 조회하는 상호작용 구간에서만 발생해 이 구간을 체감 반응성의 핵심으로 봤습니다. 산업 IoT는 유실이 곧 이상탐지 실패로 이어지는 도메인이라 평균 속도보다 무손실 여부를 핵심 지표로 판단했습니다.

**장애 대응 설계**

MQTT 브로커 계층에서 메시지 큐 관리·연결 유지·재접속 처리로 디바이스-브로커 연결을 안정화했습니다. 캐시 미스 시 디스크 기반 Query Store로 비동기 fallback하고, 아직 프리로딩되지 않은 구간을 요청받으면 스트리밍 완료까지 대기 후 처리해 즉시 실패를 막았습니다. SSE 표준의 자동 재연결·메시지 순서 보장 기능으로 연결이 일시 끊겨도 마지막 수신 지점부터 복구됩니다.
