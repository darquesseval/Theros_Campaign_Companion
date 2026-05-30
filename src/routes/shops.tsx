import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/theros/PageShell";
import { SHOP_TYPES, generateShop, type ShopSize, type ShopLocale, type ShopTypeMix } from "@/lib/theros/shops";
import { rarityLabel, rarityColor, rarityBorder, type Rarity } from "@/lib/theros/rarity";

import { Dice5 } from "lucide-react";

export const Route = createFileRoute("/shops")({
  head: () => ({
    meta: [
      { title: "Shops — Theros DM Codex" },
      { name: "description", content: "Generate Theros shop inventories by mixing categories, size, and locale rating." },
    ],
  }),
  component: ShopsPage,
});

const SIZES: { id: ShopSize; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];
const LOCALES: { id: ShopLocale; label: string; sub: string }[] = [
  { id: "rural", label: "Rural", sub: "Cheap, plain stock" },
  { id: "urban", label: "Urban", sub: "Standard prices" },
  { id: "premium", label: "Premium", sub: "Expensive, finer wares" },
];

const RARITY_ORDER: Rarity[] = ["legendary", "very-rare", "rare", "uncommon", "common"];

function ShopsPage() {
  const [mix, setMix] = useState<Record<string, number>>(() => ({ [SHOP_TYPES[0].id]: 3 }));
  const [size, setSize] = useState<ShopSize>("medium");
  const [locale, setLocale] = useState<ShopLocale>("urban");
  const [seed, setSeed] = useState(0);

  const types: ShopTypeMix[] = useMemo(
    () => Object.entries(mix).filter(([, w]) => w > 0).map(([id, weight]) => ({ id, weight })),
    [mix],
  );

  const items = useMemo(() => {
    void seed;
    return generateShop({ types, size, locale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types, size, locale, seed]);


  const priceKey = locale === "rural" ? "cheap" : locale === "premium" ? "expensive" : "normal";

  function toggleType(id: string) {
    setMix((m) => {
      const next = { ...m };
      if (next[id]) delete next[id];
      else next[id] = 3;
      return next;
    });
  }
  function setWeight(id: string, w: number) {
    setMix((m) => ({ ...m, [id]: w }));
  }

  return (
    <PageShell title="Shops of the Polis" subtitle="Combine vendor categories and weight what matters most.">
      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Shop Mix</span>
          <span className="text-xs text-muted-foreground">{types.length} active · slider = relevance</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_TYPES.map((t) => {
            const active = mix[t.id] !== undefined;
            const w = mix[t.id] ?? 0;
            return (
              <div key={t.id} className={`rounded-md border p-3 transition-colors ${active ? "border-primary/60 bg-primary/5" : "border-border bg-background"}`}>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={active} onChange={() => toggleType(t.id)} className="accent-[var(--primary)]" />
                  <span>{t.label}</span>
                </label>
                {active && (
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>niche</span><span>core focus</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={w}
                      onChange={(e) => setWeight(t.id, Number(e.target.value))}
                      className="w-full accent-[var(--primary)]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:grid-cols-2">
        <Field label="Size">
          <SegmentedControl value={size} options={SIZES} onChange={setSize} />
        </Field>
        <Field label="Locale Rating">
          <SegmentedControl
            value={locale}
            options={LOCALES.map((l) => ({ id: l.id, label: l.label }))}
            onChange={setLocale}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {LOCALES.find((l) => l.id === locale)?.sub}
          </p>
        </Field>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} items · prices shown in {priceKey} tier
        </p>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-divine)] transition-transform hover:scale-105"
        >
          <Dice5 className="h-4 w-4" /> Reroll Inventory
        </button>
      </div>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {[...items]
          .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))
          .map((it, idx) => (
            <details
              key={it.id + "_" + idx}
              className={`group rounded-md border bg-card/60 p-2 transition-colors hover:bg-secondary/40 ${rarityBorder[it.rarity]}`}
            >
              <summary className="cursor-pointer list-none">
                <p className="truncate text-xs font-medium leading-tight" title={it.name}>{it.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{it.category}</p>
                <div className="mt-1 flex items-end justify-between gap-1">
                  <span className={`text-[9px] font-display uppercase tracking-widest ${rarityColor[it.rarity]}`}>
                    {rarityLabel[it.rarity]}
                  </span>
                  <span className="font-mono text-sm font-semibold text-primary">{it.cost[it.priceTier]}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">stock ×{it.stock}</p>
              </summary>
              {it.description && (
                <p className="mt-2 border-t border-border/50 pt-2 text-[11px] leading-snug text-muted-foreground">
                  {it.description}
                </p>
              )}
            </details>
          ))}
        {items.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
            No items match this combination. Pick at least one shop category or try a different locale.
          </p>
        )}
      </div>

    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SegmentedControl<T extends string>({
  value, options, onChange,
}: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-md border border-input bg-background p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded px-2 py-1.5 text-sm transition-colors ${
            value === o.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
