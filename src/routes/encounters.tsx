import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/theros/PageShell";
import {
  BIOME_LABEL,
  rollEncounter,
  type Biome,
  type EncounterResult,
} from "@/lib/theros/encounters";
import { Dice5, Swords, Wind } from "lucide-react";

export const Route = createFileRoute("/encounters")({
  head: () => ({
    meta: [
      { title: "Encounters — Theros DM Codex" },
      { name: "description", content: "Roll random encounters for forests or roads of Theros with tag-based scaling guidance." },
    ],
  }),
  component: EncountersPage,
});

function EncountersPage() {
  const [biome, setBiome] = useState<Biome>("forest");
  const [oneInN, setOneInN] = useState(5);
  const [partyLevel, setPartyLevel] = useState(3);
  const [result, setResult] = useState<EncounterResult | null>(null);
  const [history, setHistory] = useState<EncounterResult[]>([]);

  function roll() {
    const r = rollEncounter({ biome, probability: 1 / oneInN, partyLevel });
    setResult(r);
    setHistory((h) => [r, ...h].slice(0, 10));
  }

  return (
    <PageShell title="Random Encounters" subtitle="Forest or road — and sometimes, blessedly, nothing at all.">
      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Biome</span>
          <div className="flex gap-1 rounded-md border border-input bg-background p-1">
            {(["forest", "roads", "sea", "polis", "villages"] as Biome[]).map((b) => (
              <button
                key={b}
                onClick={() => setBiome(b)}
                className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                  biome === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {BIOME_LABEL[b]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Encounter Chance</span>
            <span className="font-mono text-sm text-primary">1 in {oneInN} ({Math.round(100 / oneInN)}%)</span>
          </div>
          <input
            type="range" min={2} max={20} value={oneInN}
            onChange={(e) => setOneInN(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>frequent</span><span>rare</span>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Party Level</span>
            <span className="font-mono text-sm text-primary">{partyLevel}</span>
          </div>
          <input
            type="range" min={1} max={20} value={partyLevel}
            onChange={(e) => setPartyLevel(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Guidance is conservative — adjust stat blocks, HP, or count to suit your table.
          </p>
        </div>
      </div>

      <button
        onClick={roll}
        className="mb-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-[var(--shadow-divine)] transition-transform hover:scale-105"
      >
        <Dice5 className="h-4 w-4" /> Roll
      </button>

      {result && (
        <div
          className={`rounded-xl border bg-card p-6 shadow-[var(--shadow-card)] ${
            result.occurred ? "border-primary/50" : "border-border"
          }`}
        >
          {result.occurred ? (
            <>
              <p className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-primary">
                <span>Encounter · {BIOME_LABEL[result.biome]} · #{(result.index ?? 0) + 1}</span>
                {result.isCombat && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-destructive">
                    <Swords className="h-3 w-3" /> Combat
                  </span>
                )}
                {result.tags?.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">{t.replace("_", " ")}</span>
                ))}
              </p>
              <p className="font-serif text-lg leading-relaxed text-foreground">{result.text}</p>
              {result.advice && result.advice.length > 0 && (
                <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                  <p className="mb-2 text-xs uppercase tracking-widest text-primary">
                    Scaling &amp; GM Notes · Party Lv {result.partyLevel}
                  </p>
                  <ol className="list-decimal space-y-1 pl-5 text-foreground/90">
                    {result.advice.map((a, i) => <li key={i}>{a}</li>)}
                  </ol>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Wind className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-display text-lg tracking-wide">The road is quiet.</p>
                <p className="text-sm text-muted-foreground">No encounter this watch — the gods are silent.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 1 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-lg tracking-widest uppercase text-muted-foreground">Recent Rolls</h2>
          <ul className="space-y-2">
            {history.slice(1).map((h, i) => (
              <li key={i} className="rounded-md border border-border/60 bg-card/40 p-3 text-sm">
                {h.occurred ? (
                  <span>
                    <span className="text-primary">[{BIOME_LABEL[h.biome]} #{(h.index ?? 0) + 1}]</span>
                    {h.isCombat && <span className="ml-2 text-destructive">⚔</span>} {h.text}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">— quiet —</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
