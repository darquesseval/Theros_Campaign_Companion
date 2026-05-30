import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/theros/PageShell";
import { generateLoot, type EncounterType, type EncounterSize, type LootResult } from "@/lib/theros/loot";
import { rarityLabel, rarityColor, rarityBorder } from "@/lib/theros/rarity";
import { Coins, Dice5 } from "lucide-react";

export const Route = createFileRoute("/loot")({
  head: () => ({
    meta: [
      { title: "Loot — Theros DM Codex" },
      { name: "description", content: "Roll loot scaled to encounter type, size, and party level." },
    ],
  }),
  component: LootPage,
});

const TYPES: { id: EncounterType; label: string; sub: string }[] = [
  { id: "noble", label: "Noble", sub: "Aristocrat, archon, oligarch" },
  { id: "civil", label: "Civilian", sub: "Commoner, merchant, traveler" },
  { id: "enemy", label: "Enemy", sub: "Soldier, bandit, hoplite" },
  { id: "monster", label: "Monster", sub: "Beast of Nyx or the wilds" },
  { id: "animal", label: "Animal", sub: "Mundane wildlife" },
  { id: "nature", label: "Nature", sub: "Grove, spring, foraged" },
];

const SIZES: { id: EncounterSize; label: string }[] = [
  { id: "small", label: "Small" }, { id: "medium", label: "Medium" }, { id: "large", label: "Large" },
];

function LootPage() {
  const [type, setType] = useState<EncounterType>("enemy");
  const [size, setSize] = useState<EncounterSize>("medium");
  const [level, setLevel] = useState(3);
  const [loot, setLoot] = useState<LootResult | null>(null);

  function roll() {
    setLoot(generateLoot({ type, size, level }));
  }

  return (
    <PageShell title="Spoils of the Fallen" subtitle="What lies in the satchels, the hide, the grove.">
      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div>
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Encounter Type</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  type === t.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Size</span>
            <div className="flex gap-1 rounded-md border border-input bg-background p-1">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`flex-1 rounded px-2 py-1.5 text-sm transition-colors ${
                    size === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Party Level</span>
              <span className="font-mono text-sm text-primary">{level}</span>
            </div>
            <input
              type="range" min={1} max={20} value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      <button
        onClick={roll}
        className="mb-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-[var(--shadow-divine)] transition-transform hover:scale-105"
      >
        <Dice5 className="h-4 w-4" /> Roll Loot
      </button>

      {loot && (
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/40 bg-card p-6 shadow-[var(--shadow-card)]">
            <p className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Coins className="h-4 w-4" /> Coin Purse
            </p>
            <div className="flex flex-wrap items-baseline gap-6 font-display text-3xl tracking-wider">
              <span><span className="text-gradient-gold">{loot.gold}</span><span className="ml-1 text-sm text-muted-foreground">gp</span></span>
              <span><span className="text-foreground/80">{loot.silver}</span><span className="ml-1 text-sm text-muted-foreground">sp</span></span>
              <span><span className="text-foreground/60">{loot.copper}</span><span className="ml-1 text-sm text-muted-foreground">cp</span></span>
            </div>
          </div>

          {loot.items.length > 0 && (
            <div>
              <h2 className="mb-2 font-display text-lg tracking-widest uppercase text-muted-foreground">Items</h2>
              <ul className="space-y-2">
                {loot.items.map((it, i) => (
                  <li key={i} className={`flex items-center justify-between rounded-md border bg-card/60 px-4 py-2.5 ${rarityBorder[it.rarity]}`}>
                    <div>
                      <p className="font-medium">{it.name}</p>
                      {it.note && <p className="text-xs italic text-muted-foreground">{it.note}</p>}
                    </div>
                    <span className={`text-xs uppercase tracking-widest ${rarityColor[it.rarity]}`}>{rarityLabel[it.rarity]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loot.flavor.length > 0 && (
            <div>
              <h2 className="mb-2 font-display text-lg tracking-widest uppercase text-muted-foreground">Among the Effects</h2>
              <ul className="space-y-1.5 font-serif text-base italic">
                {loot.flavor.map((f, i) => (
                  <li key={i} className="rounded-md border border-border/50 bg-card/40 px-4 py-2">— {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
