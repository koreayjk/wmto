/** 업종 표준 목록(wmto.industry_categories). 큰 분류(group) 아래에 선택 가능한 업종이 있습니다. */
export type Category = { id: number; name_ko: string; name_en: string; group_ko: string; group_en: string };

type Row = { id: number; name_ko: string; name_en: string; parent_id: number | null; sort: number; active: boolean };

/** 표를 읽지 못하면(아직 마이그레이션 전 등) 빈 목록을 돌려줍니다. */
export async function loadCategories(db: { from: (t: string) => unknown }): Promise<Category[]> {
  try {
    const q = (db.from("industry_categories") as { select: (c: string) => { order: (c: string) => PromiseLike<{ data: Row[] | null }> } }).select("id,name_ko,name_en,parent_id,sort,active").order("sort");
    const { data } = await q;
    const rows = (data ?? []).filter((r) => r.active);
    const groups = new Map(rows.filter((r) => r.parent_id === null).map((g) => [g.id, g]));
    return rows
      .filter((r) => r.parent_id !== null && groups.has(r.parent_id))
      .map((r) => ({ id: r.id, name_ko: r.name_ko, name_en: r.name_en, group_ko: groups.get(r.parent_id!)!.name_ko, group_en: groups.get(r.parent_id!)!.name_en }));
  } catch {
    return [];
  }
}

/** 큰 분류별로 묶습니다(선택 상자의 optgroup 용). */
export function groupCategories(list: Category[], locale: "ko" | "en") {
  const out = new Map<string, { id: number; label: string }[]>();
  for (const c of list) {
    const g = locale === "en" ? c.group_en : c.group_ko;
    out.set(g, [...(out.get(g) ?? []), { id: c.id, label: locale === "en" ? c.name_en : c.name_ko }]);
  }
  return [...out].map(([group, items]) => ({ group, items }));
}
