export interface BasicInfo {
  name: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface ResumeIntro {
  headline: string;
  // 문단 그룹의 배열. 같은 그룹 안 문장은 줄바꿈만 되고(<br>), 그룹 사이에만 여백이 붙음.
  // <strong>으로 감싸면 굵게 표시됨(raw HTML로 렌더링)
  paragraphs: string[][];
}

// highlight 한 줄 = lead(핵심 동작/결정, 굵게) + detail(판단 근거·수치, 작고 옅게). detail은 선택.
export interface Highlight {
  lead: string;
  detail?: string;
}

export interface Project {
  name: string;
  period: string;
  role: string;
  url?: string;
  // 회사/프로젝트 아래 1~2문장 요약(인용구로 표시). 기존 하이라이트·포트폴리오 배경을 압축해서 쓸 것 - 새 사실을 지어내지 말 것.
  summary: string[];
  highlights: Highlight[];
}

export interface Career {
  company: string;
  period: string;
  role: string;
  team: string;
  summary: string[];
  highlights: Highlight[];
}

export interface Paper {
  title: string;
  venue: string;
  url?: string;
  highlights?: string[];
}

export interface Education {
  school: string;
  period: string;
  degree: string;
  papers?: Paper[];
}

export interface Award {
  name: string;
  date: string;
}

export interface Certificate {
  name: string;
  date: string;
}

// 사이드바(좌측 상단)에 표시되는 이름/한줄소개. Resume 본문과는 별개로 관리함.
export const basicInfo: BasicInfo = {
  name: "김민서",
  tagline: "Backend Developer",
  email: "misneo@kakao.com",
  github: "https://github.com/git-mesome",
  linkedin: "https://www.linkedin.com/in/minseo-kim-0b25b2128",
};

// Resume 페이지 본문 헤드라인. 사이드바와 동기화하지 않음 - 원하는 문구로 자유롭게 수정.
export const resumeIntro: ResumeIntro = {
  headline: "일정을 놓치지 않고, 시간을 지키는 믿음직한 개발자입니다.",
  paragraphs: [
    ["정해진 기한 안에서 <strong>무엇을 남기고 무엇을 포기할지 먼저 판단하는 것</strong>을, 개발자의 기본기라고 생각합니다."],
    [
      "동작하는 코드를 넘어 <strong>유지보수가 쉬운 구조</strong>를 고민하며, 변화에 유연하게 대응할 수 있는 설계를 지향합니다.",
      "기술 결정마다 배경과 트레이드오프를 ADR로 남기고, <strong>팀의 암묵지를 언어로 정리하여 맥락을 나누는 것</strong>이 좋은 엔지니어의 기본이라 생각합니다.",
    ],
    [
      "혼자 잘하는 것보다 <strong>팀이 같은 정보를 보고 판단하게 만드는 데</strong> 관심이 많습니다.",
      "프로젝트에서 PO 역할때도 팀의 우선순위와 진행 상황을 모두가 볼 수 있는 형태로 정리해, 일정 리스크를 먼저 파악할 수 있게 했습니다.",
    ],
    [
      "AI에게 위임할 영역과 제가 직접 판단해야 할 흐름을 나누고, 계획 문서를 기준으로 AI 결과물이 요구사항을 벗어나지 않았는지 확인한 뒤 채택합니다.",
      "구현은 맡기되 <strong>설계 판단과 책임은 제 몫으로 둡니다.</strong>",
    ],
  ],
};

export const projects: Project[] = [
  {
    name: "AI Agent 마켓플레이스",
    period: "2026.06 - 2026.07 (2개월)",
    role: "PO 및 백엔드 개발",
    url: "/portfolio/prompthub-auth-gateway",
    summary: [
      "BE 5명 규모 MSA 팀 프로젝트에서 팀 리더 겸 PO로 서비스 기획과 아키텍처 설계를 총괄했습니다.",
    ],
    highlights: [
      {
        lead: "인증 아키텍처 설계 전환",
        detail: "auth-service 분리·Redis 인가 초안 폐기 → forward-auth 중앙화 · 카카오 로그인 인증 우회 결함 발견·수정",
      },
      {
        lead: "상품 콘텐츠 표절 탐지 설계",
        detail: "블록체인/NFT 초안 폐기 → 정규화 해시 완전일치 · 실패모드 2종 중 1종만 제거, 나머지는 의도적 보류",
      },
      {
        lead: "서비스 간 통신 구조 재정의",
        detail: "AI 아키텍처 결론 근거 검증(환각 확인) · 외부 실무자 2명 검증 · 내부 gRPC → 프론트 화면 조합",
      },
      {
        lead: "PR 리뷰·QA 전담",
        detail: "백엔드 PR 220개 리뷰 · 버그 30개 이상 직접 발견",
      },
    ],
  },
  {
    name: "공연 좌석 티켓팅 서비스 - NextFrame (WiSoft)",
    period: "2025.05 - 2025.12 (8개월)",
    role: "백엔드 개발",
    url: "/portfolio/next-frame-payment",
    summary: [
      "공연 좌석 예매 플랫폼의 Payment Server를 DDD·헥사고날 아키텍처로 설계·구현했습니다.",
    ],
    highlights: [
      {
        lead: "결제 트랜잭션 경계 재설계",
        detail: "PG 호출+DB 저장 커넥션 점유 최대 8초 발견 → PaymentService 오케스트레이터 분리",
      },
      {
        lead: "결제 후속 작업 유실 방지",
        detail: "DB 기반 Outbox 패턴 · 지수 백오프(5s~10m) · 4회 실패 시 FAILED 처리",
      },
      {
        lead: "외부 장애 대응 설계",
        detail: "스레드풀 소진 지점 발견 → CircuitBreaker 적용 · PG confirm/cancel 제외 항목 선저장으로 유실 갭 해소",
      },
    ],
  },
];

export const careers: Career[] = [
  {
    company: "주식회사 로보볼트",
    period: "2023.06 - 2024.05 (12개월)",
    role: "주임",
    team: "연구개발팀",
    summary: ["AWS 인프라를 자사 온프레미스로 이전하고, 배터리 로그 데이터 적재·DB 성능 튜닝까지 연구개발팀에서 주도했습니다."],
    highlights: [
      {
        lead: "AWS → 자사 온프레미스 이전으로 연간 클라우드 서버 비용 1,200만 원 절감",
        detail: "Frontend/Backend/Media/Edge 서버 분리 운영",
      },
      {
        lead: "70GB 규모 배터리 로그 정제 및 DB 적재 자동화",
        detail: "crontab + Trigger 기반 정기 실행",
      },
      {
        lead: "대용량 데이터 조회 성능 개선을 위한 인덱스 설계 및 DB 튜닝",
        detail: "PostgreSQL",
      },
    ],
  },
];

export const skills: string[] = ["[TODO]"];

export const education: Education[] = [
  {
    school: "프로그래머스",
    period: "2026.06 - 2026.07",
    degree: "개발자 부트캠프",
  },
  {
    school: "국립한밭대학교 모바일융합공학과",
    period: "2023.09 - 2025.08",
    degree: "공학석사",
    papers: [
      {
        title: "산업용 IoT 환경에서의 실시간 모니터링을 위한 반응형 스트리밍 기반 프리로딩 구조",
        venue: "한국정보통신학회논문지 (2025.09) · KCI 등재",
        url: "/portfolio/rt-rss",
        highlights: [
          "반복 구간 탐색 시 서버 왕복이 매번 발생하는 병목을 SSE+프리로딩으로 제거, 요청 6회→1회·응답시간 75.7% 개선(32.4→7.9ms)",
          "Backpressure+CQRS(PostgreSQL/Redis)로 스트리밍 파이프라인 설계, 동시 100명·5분/10명·1시간 조건에서 누락률 0% 검증(동기식 대비 0.03~0.06% 누락)",
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
    school: "국립한밭대학교 정보통신공학과",
    period: "2019.03 - 2023.02",
    degree: "공학사",
    papers: [
      {
        title: "식품 쓰레기를 줄이기 위한 식재료 공유 웹 플랫폼",
        venue: "한국HCI학회 (2023.02)",
      },
    ],
  },
];

export const awards: Award[] = [
  { name: "2024 전공 Lab 기반 기업문제해결 PBL 과정 - 대상", date: "2024.11" },
  { name: "2022학년도 K7U Belt 캡스톤디자인 경진대회 - 최우수상", date: "2022.11" },
  { name: "RIS-SW/AI 캡스톤디자인 경진대회 - 입상", date: "2023.01" },
  { name: "제 11회 정보기술대학 작품전시회 - 동상", date: "2022.12" },
  { name: "2020학년도 K7U Belt 캡스톤디자인 경진대회 - 우수상", date: "2020.11" },
];

export const certificates: Certificate[] = [
  { name: "SQLD", date: "2024.06" },
  { name: "General English Course (University of Leeds)", date: "2022.07" },
];