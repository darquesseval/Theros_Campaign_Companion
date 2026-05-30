import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/theros/PageShell";
import { ALL_ITEMS, SHOP_TYPES } from "@/lib/theros/shops";
import { rarityFromCostCp, rarityLabel, rarityColor, rarityBorder, type Rarity } from "@/lib/theros/rarity";
import { Search } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Theros DM Codex" },
      { name: "description", content: "Search and filter every item in the Theros catalog by name, rarity, locale, and vendor." },
    ],
  }),
  component: SearchPage,
});

const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "very-rare", "legendary"];

type LocaleKey = "any" | "rural" | "urban" | "premium";

function formatCopper(cp: number): string {
  if (cp >= 100) return `${Number((cp / 100).toFixed(2)).toLocaleString()} gp`;
  if (cp >= 10) return `${Number((cp / 10).toFixed(1)).toLocaleString()} sp`;
  return `${cp.toLocaleString()} cp`;
}

// Pre-enrich once at module scope so the filter is fast and stable.
const ENRICHED = ALL_ITEMS
  .filter((i) => i.cost_cp && typeof i.cost_cp.normal === "number")
  .map((i) => {
    const shopTypeLabels = SHOP_TYPES.filter((type) => type.vendors.includes(i.vendor))
      .map((type) => type.label)
      .join(" ");

    return {
      ...i,
      rarity: rarityFromCostCp(i.cost_cp.normal),
      searchText: `${i.name} ${i.category} ${i.vendor} ${shopTypeLabels} ${i.description ?? ""} ${(i.tags || []).join(" ")}`.toLowerCase(),
    };
  });

function SearchPage() {
  const [q, setQ] = useState("");
  const [rarities, setRarities] = useState<Set<Rarity>>(new Set());
  const [vendors, setVendors] = useState<Set<string>>(new Set());
  const [locale, setLocale] = useState<LocaleKey>("any");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ENRICHED.filter((i) => {
      if (term && !i.searchText.includes(term)) return false;
      if (rarities.size && !rarities.has(i.rarity)) return false;
      if (vendors.size && !vendors.has(i.vendor)) return false;
      if (locale === "rural" && !i.ruralLocale) return false;
      if (locale === "urban" && !i.urbanLocale) return false;
      if (locale === "premium" && !i.premiumLocale) return false;
      return true;
    }).sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) || a.name.localeCompare(b.name));
  }, [q, rarities, vendors, locale]);

  const gridKey = `${q.trim().toLowerCase()}-${locale}-${[...rarities].sort().join("|")}-${[...vendors].sort().join("|")}`;

  function toggle<T>(set: Set<T>, v: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setter(next);
  }

  return (
    <PageShell title="Catalog Search" subtitle={`Search across all ${ENRICHED.length} items in the Theros codex.`}>
      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, category, description, or tag…"
            className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">Rarity</div>
          <div className="flex flex-wrap gap-1.5">
            {RARITY_ORDER.map((r) => {
              const active = rarities.has(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggle(rarities, r, setRarities)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active ? `${rarityBorder[r]} bg-secondary ${rarityColor[r]}` : "border-border text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {rarityLabel[r]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">Locale</div>
          <div className="flex gap-1 rounded-md border border-input bg-background p-1 max-w-md">
            {(["any", "rural", "urban", "premium"] as LocaleKey[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={`flex-1 rounded px-2 py-1.5 text-xs capitalize transition-colors ${
                  locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">Shop Category</div>
          <div className="flex flex-wrap gap-1.5">
            {SHOP_TYPES.map((t) => {
              const active = t.vendors.some((v) => vendors.has(v));
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const next = new Set(vendors);
                    const has = t.vendors.some((v) => next.has(v));
                    for (const v of t.vendors) (has ? next.delete(v) : next.add(v));
                    setVendors(next);
                  }}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    active ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{results.length} items</p>
      <div key={gridKey} className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((it) => (
          <details key={it.id} className={`group rounded-md border bg-card/60 p-2 ${rarityBorder[it.rarity]}`}>
            <summary className="cursor-pointer list-none">
              <p className="truncate text-xs font-medium leading-tight" title={it.name}>{it.name}</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{it.category}</p>
              <div className="mt-1 flex items-end justify-between gap-1">
                <span className={`text-[9px] font-display uppercase tracking-widest ${rarityColor[it.rarity]}`}>
                  {rarityLabel[it.rarity]}
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {it.cost?.normal ?? formatCopper(it.cost_cp.normal)}
                </span>
              </div>
            </summary>
            {it.description && (
              <p className="mt-2 border-t border-border/50 pt-2 text-[11px] leading-snug text-muted-foreground">
                {it.description}
              </p>
            )}
          </details>
        ))}
        {results.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
            No items match these filters.
          </p>
        )}
      </div>
    </PageShell>
  );
}
