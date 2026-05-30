import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/theros/PageShell";
import { NAMES, generateNPC, type NPC, type Race } from "@/lib/theros/npcs";
import { Dice5, Sparkles } from "lucide-react";

export const Route = createFileRoute("/npcs")({
  head: () => ({
    meta: [
      { title: "NPCs — Theros DM Codex" },
      { name: "description", content: "Generate unique Theros NPCs with names, looks, and personality traits by race." },
    ],
  }),
  component: NPCsPage,
});

const RACES = Object.keys(NAMES) as Race[];

function NPCsPage() {
  const [race, setRace] = useState<Race>("Human");
  const [gender, setGender] = useState<"any" | "male" | "female">("any");
  const [npc, setNpc] = useState<NPC | null>(null);
  const [history, setHistory] = useState<NPC[]>([]);

  function roll() {
    const g = gender === "any" ? undefined : gender;
    const n = generateNPC(race, g);
    setNpc(n);
    setHistory((h) => [n, ...h].slice(0, 8));
  }

  return (
    <PageShell title="Wanderers & Strangers" subtitle="Choose a people of Theros; the polis will name one of its own.">
      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Race</span>
          <div className="flex flex-wrap gap-1.5">
            {RACES.map((r) => (
              <button
                key={r}
                onClick={() => setRace(r)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  race === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Gender</span>
          <div className="flex gap-1 rounded-md border border-input bg-background p-1">
            {(["any", "male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 rounded px-2 py-1.5 text-sm capitalize transition-colors ${
                  gender === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={roll}
        className="mb-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-[var(--shadow-divine)] transition-transform hover:scale-105"
      >
        <Dice5 className="h-4 w-4" /> Summon a Stranger
      </button>

      {npc && (
        <article className="rounded-xl border border-primary/40 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-xs uppercase tracking-widest text-primary">{npc.race} · {npc.pronouns}</p>
          </div>
          <h2 className="font-display text-3xl tracking-wide text-gradient-gold">{npc.name}</h2>
          <dl className="mt-5 space-y-4 font-serif text-base leading-relaxed">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Appearance</dt>
              <dd className="mt-1">{npc.appearance}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Personality</dt>
              <dd className="mt-1">{npc.personality}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Quirk</dt>
              <dd className="mt-1 italic">{npc.quirk}</dd>
            </div>
          </dl>
        </article>
      )}

      {history.length > 1 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-lg tracking-widest uppercase text-muted-foreground">Previously Summoned</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {history.slice(1).map((h, i) => (
              <li key={i} className="rounded-md border border-border/60 bg-card/40 p-3 text-sm">
                <p className="font-display tracking-wide text-foreground">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.race} · {h.pronouns}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
