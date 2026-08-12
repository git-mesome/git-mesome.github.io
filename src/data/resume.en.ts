import type { BasicInfo, ResumeIntro, Project, Career, Education, Award, Certificate } from "./resume.ts";
import { basicInfo as basicInfoKo, awards as awardsKo, certificates as certificatesKo } from "./resume.ts";

// 이름만 로마자 표기, 나머지(이메일/링크/tagline)는 언어 무관이라 그대로 재사용
export const basicInfo: BasicInfo = {
  ...basicInfoKo,
  name: "Minseo Kim",
};

export const resumeIntro: ResumeIntro = {
  headline: "A reliable developer who keeps schedules and never misses a deadline.",
  paragraphs: [
    [
      "I believe that <strong>deciding what to keep and what to cut within a fixed deadline</strong> is a developer's most basic skill.",
    ],
    [
      "Beyond code that simply works, I aim for <strong>structures that are easy to maintain</strong> and designs that can adapt flexibly to change.",
      "I record the background and trade-offs behind every technical decision as an ADR, because I believe <strong>turning a team's tacit knowledge into shared language</strong> is part of being a good engineer's fundamentals.",
    ],
    [
      "I care more about <strong>getting the team to see the same information and decide together</strong> than about performing well alone.",
      "As PO on a project, I <a href=\"/en/portfolio/prompthub-issue-management\">organized the team's priorities and progress into a form everyone could see</a>, so schedule risk could be caught early.",
    ],
    [
      "I <a href=\"/en/portfolio/prompthub-ai-collaboration\">separate what I delegate to AI from the flow I need to judge myself</a>, and only adopt AI output after checking it against the plan document to confirm it hasn't drifted from requirements.",
      "I hand off implementation, but <strong>keep design judgment and accountability as my own.</strong>",
    ],
  ],
};

export const projects: Project[] = [
  {
    name: "AI Agent Marketplace",
    period: "2026.06 - 2026.07",
    role: "PO & Backend Developer",
    url: "/en/portfolio/prompthub-auth-gateway",
    summary: [
      "Led service planning and architecture design as team lead and PO on a 5-person backend MSA team project.",
    ],
    techStack: [
      "Spring Boot",
      "Spring Cloud",
      "Spring Batch",
      "Spring Data JPA",
      "PostgreSQL",
      "Redis",
      "JWT",
      "OAuth",
      "Spring AI",
      "gRPC",
      "REST API",
      "Kafka",
      "Docker",
      "k8s",
      "ELK",
      "MSA",
    ],
    highlights: [
      {
        lead: "Redesigned the authentication architecture",
        detail:
          "Scrapped the auth-service split / Redis authorization draft → centralized forward-auth · found and fixed a Kakao login auth-bypass flaw",
      },
      {
        lead: "Designed plagiarism detection for product content",
        detail:
          "Scrapped the blockchain/NFT draft → exact-match on normalized hashes · removed 1 of 2 failure modes, deliberately deferred the other",
      },
      {
        lead: "Redefined inter-service communication",
        detail:
          "Verified the reasoning behind an AI architecture conclusion (caught a hallucination) · validated with 2 outside practitioners · moved screen composition from internal gRPC to the frontend",
      },
      {
        lead: "Owned PR review and QA",
        detail: "Reviewed 220 backend PRs · personally found 30+ bugs",
      },
    ],
  },
  {
    name: "Live Performance Seat Ticketing Service - NextFrame (WiSoft)",
    period: "2025.05 - 2025.12",
    role: "Backend Developer",
    url: "/en/portfolio/next-frame-payment",
    summary: [
      "Designed and built the Payment Server for a live performance seat-booking platform — including real-time seat holds and QR ticket issuance — using DDD and a hexagonal architecture.",
    ],
    techStack: [
      "Java 21",
      "Spring Boot",
      "QueryDsl",
      "PostgreSQL",
      "Resilience4j(CircuitBreaker)",
      "DDD",
      "Hexagonal Architecture",
      "Outbox Pattern",
      "Toss Payments",
    ],
    highlights: [
      {
        lead: "Redesigned payment transaction boundaries",
        detail: "Found the PG call + DB write held a connection for up to 8 seconds → split PaymentService into a pure orchestrator",
      },
      {
        lead: "Prevented loss of post-payment follow-up work",
        detail: "DB-based Outbox pattern · exponential backoff (5s-10m) · marked FAILED after 4 retries",
      },
      {
        lead: "Designed for external failure handling",
        detail:
          "Found a thread-pool exhaustion point → applied CircuitBreaker · closed the loss gap by pre-saving items excluded from PG confirm/cancel",
      },
    ],
  },
];

export const careers: Career[] = [
  {
    company: "RoboVolt Inc.",
    period: "2023.06 - 2024.05",
    role: "Assistant Manager",
    team: "R&D Team",
    summary: [
      "Led migration of AWS infrastructure to in-house on-premise servers, along with battery log data ingestion and DB performance tuning, within the R&D team.",
    ],
    highlights: [
      {
        lead: "Migrated AWS → in-house on-premise, cutting annual cloud server cost by ₩12 million",
        detail: "Ran separate Frontend/Backend/Media/Edge servers",
      },
      {
        lead: "Automated cleansing and DB ingestion of 70GB of battery log data",
        detail: "Scheduled via crontab + DB triggers",
      },
      {
        lead: "Index design and DB tuning to improve large-dataset query performance",
        detail: "PostgreSQL",
      },
    ],
  },
];

export const education: Education[] = [
  {
    school: "Programmers",
    period: "2026.06 - 2026.07",
    degree: "Developer Bootcamp",
  },
  {
    school: "Hanbat National University, Dept. of Mobile Convergence Engineering",
    period: "2023.09 - 2025.08",
    degree: "M.S. in Engineering",
    papers: [
      {
        title: "산업용 IoT 환경에서의 실시간 모니터링을 위한 반응형 스트리밍 기반 프리로딩 구조",
        venue: "한국정보통신학회논문지 (2025.09) · KCI 등재",
        url: "/en/portfolio/rt-rss",
        highlights: [
          "Eliminated the bottleneck of a server round-trip on every repeated-segment lookup using SSE + preloading — cut requests from 6 to 1 and improved response time by 75.7% (32.4ms → 7.9ms)",
          "Designed the streaming pipeline with Backpressure + CQRS (PostgreSQL/Redis); verified a 0% miss rate under both 100 concurrent users/5 min and 10 users/1 hour conditions (vs. 0.03-0.06% for the synchronous baseline)",
        ],
      },
      {
        title: "RFID 기반 키 관리 애플리케이션을 통한 강의실 자원 최적화 시스템 설계",
        venue: "한국HCI학회 (2025.02)",
      },
      {
        title: "소규모 기업을 위한 FIDO2 기반 공용 인증 서버 설계",
        venue: "한국정보과학회 (2024.12)",
      },
    ],
  },
  {
    school: "Hanbat National University, Dept. of Information & Communication Engineering",
    period: "2019.03 - 2023.02",
    degree: "B.S. in Engineering",
    papers: [
      {
        title: "식품 쓰레기를 줄이기 위한 식재료 공유 웹 플랫폼",
        venue: "한국HCI학회 (2023.02)",
      },
    ],
  },
];

// 수상명·자격증명은 공식 한국어 명칭을 그대로 유지 (CLAUDE.md 번역 원칙)
export const awards: Award[] = awardsKo;
export const certificates: Certificate[] = certificatesKo;
