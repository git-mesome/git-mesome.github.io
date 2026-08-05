import type { CollectionEntry } from "astro:content";

export interface PortfolioGroup {
  company: string | null;
  projects: CollectionEntry<"portfolio">[];
  troubleshooting: CollectionEntry<"portfolio">[];
}

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
      projects: items.filter((item) => item.data.type === "project"),
      troubleshooting: items.filter((item) => item.data.type === "troubleshooting"),
    });
  }

  // company 없는(미분류) 그룹을 맨 위로
  groups.sort((a, b) => (a.company === null ? -1 : b.company === null ? 1 : 0));
  return groups;
}
