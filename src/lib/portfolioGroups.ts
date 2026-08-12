import type { CollectionEntry } from "astro:content";

export interface PortfolioGroup {
  company: string | null;
  period: string | null;
  projects: CollectionEntry<"portfolio">[];
  troubleshooting: CollectionEntry<"portfolio">[];
  practice: CollectionEntry<"portfolio">[];
}

// 표시 순서: 최신 경력부터. 목록에 없는 company는 맨 뒤로 밀림.
// 영문 콘텐츠(.en.md)는 company 값도 번역돼 있어 두 언어 표기를 모두 등록해둔다.
const COMPANY_ORDER = [
  "AI Agent 마켓플레이스",
  "AI Agent Marketplace",
  "NextFrame (WiSoft)",
  "Graduate Research",
];

export function groupPortfolioEntries(entries: CollectionEntry<"portfolio">[]): PortfolioGroup[] {
  const byCompany = new Map<string | null, CollectionEntry<"portfolio">[]>();
  for (const entry of entries) {
    const key = entry.data.company ?? null;
    const list = byCompany.get(key) ?? [];
    list.push(entry);
    byCompany.set(key, list);
  }

  const groups: PortfolioGroup[] = [];
  for (const [company, items] of byCompany) {
    items.sort((a, b) => a.data.order - b.data.order);
    groups.push({
      company,
      period: items[0]?.data.period ?? null,
      projects: items.filter((item) => item.data.type === "project"),
      troubleshooting: items.filter((item) => item.data.type === "troubleshooting"),
      practice: items.filter((item) => item.data.type === "practice"),
    });
  }

  const rank = (company: string | null) => {
    const idx = company === null ? -1 : COMPANY_ORDER.indexOf(company);
    return idx === -1 ? COMPANY_ORDER.length : idx;
  };
  groups.sort((a, b) => rank(a.company) - rank(b.company));
  return groups;
}
