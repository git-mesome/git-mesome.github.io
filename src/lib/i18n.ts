export type Lang = "ko" | "en";

export const DEFAULT_LANG: Lang = "ko";

// 콘텐츠 컬렉션 폴더 규칙: "slug.md" = 한국어, "en/slug.md" = 영어.
// (Astro glob 로더가 파일명 안의 "."을 id 생성 시 제거해버려서 "slug.en.md" 방식은 쓸 수 없다 - 대신 en/ 하위 폴더로 분리)
export function splitLocaleId(id: string): { baseId: string; lang: Lang } {
  if (id.startsWith("en/")) {
    return { baseId: id.slice(3), lang: "en" };
  }
  return { baseId: id, lang: "ko" };
}

export function withLangPrefix(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? "/en" : `/en${path}`;
}

// 현재 경로를 유지한 채 다른 언어의 상응 경로를 계산 (언어 토글 버튼용)
export function otherLangHref(lang: Lang, pathname: string): string {
  if (lang === "en") {
    const rest = pathname.replace(/^\/en\/?/, "/");
    return rest;
  }
  return pathname === "/" ? "/en" : `/en${pathname}`;
}

export const ui = {
  ko: {
    mainNavLabel: "주 메뉴",
    resume: "Resume",
    portfolio: "Portfolio",
    books: "Books",
    blog: "Blog",
    darkModeToggle: "다크모드로 전환",
    lightModeToggle: "라이트모드로 전환",
    print: "인쇄",
    langToggleLabel: "View in English",
    langToggleShort: "EN",
    planningLabel: "기획 · 설계 판단",
    troubleshootingLabel: "트러블슈팅",
    practiceLabel: "일하는 방식",
    portfolioNote: (link: string) => `자세한 내용은 <a href="${link}">포트폴리오</a>를 참고해 주세요.`,
    portfolioIndexDescription: "회사별 프로젝트 및 Troubleshooting 사례",
    booksIndexDescription: "읽은 책 목록과 인상 깊게 읽은 책",
    featuredBooksHeading: "인상 깊게 읽은 책",
    todoImage: "[TODO-이미지]",
    todoBlurb: "[TODO] 짧은 리뷰",
    coverAlt: (title: string) => `${title} 표지`,
    pageTitle: "김민서 : 항상 건강하세요.",
    defaultDescription: "김민서의 이력서·포트폴리오",
  },
  en: {
    mainNavLabel: "Main menu",
    resume: "Resume",
    portfolio: "Portfolio",
    books: "Books",
    blog: "Blog",
    darkModeToggle: "Switch to dark mode",
    lightModeToggle: "Switch to light mode",
    print: "Print",
    langToggleLabel: "한국어로 보기",
    langToggleShort: "KO",
    planningLabel: "Planning & Design Decisions",
    troubleshootingLabel: "Troubleshooting",
    practiceLabel: "Ways of Working",
    portfolioNote: (link: string) => `See the <a href="${link}">portfolio</a> for details.`,
    portfolioIndexDescription: "Projects and troubleshooting cases by company",
    booksIndexDescription: "Books I've read, with short reviews for the ones that stuck",
    featuredBooksHeading: "Books That Stuck With Me",
    todoImage: "[TODO-IMAGE]",
    todoBlurb: "[TODO] short review",
    coverAlt: (title: string) => `${title} cover`,
    pageTitle: "Minseo Kim : Stay healthy.",
    defaultDescription: "Minseo Kim's resume & portfolio",
  },
} as const;

export function getLang(astroCurrentLocale: string | undefined): Lang {
  return astroCurrentLocale === "en" ? "en" : "ko";
}
