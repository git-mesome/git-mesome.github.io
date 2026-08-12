# CLAUDE.md

이 리포는 GitHub Pages(`git-mesome.github.io`)에 배포하는 개인 이력서/포트폴리오 사이트다. 아래 지침은 이 리포에서 작업할 때 항상 적용한다.

## 기술 스택 (제약)

- Astro + TypeScript
- 배포: GitHub Pages + GitHub Actions (자동 배포 워크플로우 포함)
- 다국어 지원: 한국어(기본) + 영어. Astro 공식 i18n 라우팅 사용 (`astro.config.mjs`의 `i18n` 옵션, `defaultLocale: "ko"`, `prefixDefaultLocale: false` → 한국어는 루트 경로, 영어는 `/en/...`)
- Portfolio·Books·Blog: Astro Content Collections (마크다운 파일 = 글 하나, 타입 안전 frontmatter)
- 외부 의존성 최소화. 무거운 UI 라이브러리 금지. 다크모드 대응 필수.

## 네비게이션 / 페이지 구조

- 상단 메뉴: Resume, Portfolio, Books, Blog
- 언어 토글: 사이드바 하단 다크모드↔프린트 버튼 사이에 위치. 현재 경로를 유지한 채 `/en` 접두사만 붙였다 뗐다 하는 서버 렌더 링크(JS 없음)
- Resume: 경력/학력/자격증
- Portfolio: 회사별 프로젝트 상세 페이지
  - 내부 이동: 좌측 사이드바로 회사 &gt; 프로젝트/Troubleshooting 트리 탐색 (모바일은 상단 드롭다운/토글로 전환)
  - 상세 페이지 섹션 순서: 메타데이터(회사명·기간) → 배경(문제 인식) → 성과 → 설계 및 구현(판단·해결, 운영/리스크 대응·회고 포함)
    (성과를 앞에 두는 이유: 상세페이지까지 스크롤/완독 안 하는 독자가 많아 핵심 결과를 먼저 보여주는 쪽을 택함. 운영/회고는 독립 섹션이 아니라 설계 및 구현 안에 흡수)
  - Troubleshooting: 프로젝트 단위가 아닌 개별 문제해결 사례. 같은 트리에서 프로젝트와 함께 노출
- Books: 읽은 책 목록 + 책별 짧은 리뷰란(내 생각)
- Blog: 블로그 연동 링크

## 콘텐츠 관리

- Resume 데이터는 `src/data/resume.ts`로 분리한다 (짧고 구조화된 목록이라 데이터 파일이 적합). 마크업에 하드코딩하지 말 것.
- Portfolio / Books / Blog는 Content Collections로 관리한다 (긴 서술+이미지가 들어가는 콘텐츠라 마크다운이 적합):
  - Portfolio frontmatter: `company`, `period`, `role`, `techStack`, `order`, `type`(`'project' | 'troubleshooting'`)
  본문: 배경 / 성과 / 설계 및 구현(운영·회고 포함) 섹션을 마크다운으로 작성. 다이어그램은 mermaid 코드블록, 스크린샷은 이미지 삽입.
  - Blog frontmatter: `title`, `date`, `tags`, `description`
  - Books frontmatter: `title`, `author`, `readDate`, `rating`, `cover`(선택)
- 이미지(다이어그램·스크린샷)는 `src/assets/portfolio/{company}/{project}/` 아래 저장한다. 마크다운에서 alt 텍스트 필수.
- 폴더 구조 + 샘플 글 1개가 갖춰진 뒤로는 콘텐츠를 마크다운 파일 추가만으로 늘려간다. 구조 자체를 다시 짤 필요는 없다.
- 영문 콘텐츠 파일 위치: 원본 `slug.md`(한국어)와 같은 컬렉션 폴더 아래 `en/slug.md`를 추가한다 (예: `portfolio/next-frame-payment.md` / `portfolio/en/next-frame-payment.md`). Astro glob 로더가 파일명 속 점(`.`)을 id 생성 시 제거해버려서 `slug.en.md` 형태는 쓸 수 없다 — 반드시 `en/` 하위 폴더로 분리할 것. `src/lib/i18n.ts`의 `splitLocaleId`가 `en/` 접두사로 로케일을 판별해 같은 slug로 라우팅한다.
- 번역 원칙: 책 제목·저자명·논문 게재지·수상/대회 공식 명칭 등 고유명사는 원문(한국어) 그대로 둔다 (임의로 영문 제목을 지어내지 말 것). 그 외 서술 문장은 자연스러운 영어로 번역한다.
- Books는 분량이 많아 전체를 번역하지 않는다. `featured: true`인 도서만 리뷰 본문·blurb를 영문화하고, 나머지는 목록에서 원문(한국어) 그대로 노출한다.

## 품질 기준

- SEO 메타태그(title, description, og:image)
- 시맨틱 HTML + 기본 접근성(alt, 색 대비, 키보드 포커스)
- 반응형(모바일 우선), 빠른 로딩, 불필요한 JS 없이

## 문장 톤

Resume/Portfolio 문장은 @resume-portfolio-tone-guide.md 의 규칙을 따른다.
핵심만 요약하면: 기능 자랑 금지, "문제 → 고민(+정량근거) → 대안 → 결정(+trade-off) → 결과 → 운영/리스크 대응" 서사, 정답보다 판단 근거 우선.
About/Books 같은 개인 서술 섹션에만 기존 블로그 문체(VOICE_PROFILE)를 사용한다.

## 하지 말 것

- 내가 주지 않은 경력/성과/책 감상을 지어내지 말 것. 빈 곳은 `[TODO]`로 표시.
- 다이어그램·스크린샷 이미지를 대신 생성하거나 placeholder 이미지로 채우지 말 것. 이미지 자리는 `[TODO-이미지]`로 표시.
- 번역 시 원문에 없는 사실·수치·평가를 지어내지 말 것. 고유명사(책 제목·저자·논문 게재지·수상명)를 임의로 영역(英譯)하지 말 것.

