import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/theros/SiteHeader";
import { Sword, Map, Users, Coins, ScrollText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Theros DM Codex — Campaign Tools" },
      { name: "description", content: "Generate shops, encounters, NPCs, and loot for your Theros D&D campaign." },
      { property: "og:title", content: "Theros DM Codex" },
      { property: "og:description", content: "A toolkit for running campaigns in the mythic realm of Theros." },
    ],
  }),
  component: Index,
});

const TOOLS = [
  { to: "/shops", icon: Sword, title: "Shops", desc: "Curated inventory by size, type, and locale — from rural stalls to premium emporia." },
  { to: "/encounters", icon: Map, title: "Encounters", desc: "Roll forest or road encounters with adjustable odds — silence is also a result." },
  { to: "/npcs", icon: Users, title: "NPCs", desc: "Theros-flavored names, traits, and looks for any race in the polis." },
  { to: "/loot", icon: Coins, title: "Loot", desc: "Coin and items scaled to encounter size, level, and the nature of the fallen." },
] as const;

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-20 text-center sm:pt-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-secondary/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
            <ScrollText className="h-3.5 w-3.5" /> Dungeon Master Codex
          </p>
          <h1 className="font-display text-5xl tracking-wider text-gradient-gold sm:text-7xl">
            Theros
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg italic text-muted-foreground sm:text-xl">
            Beneath the stars of Nyx and the watchful gaze of the gods, the polis sleeps and the wilds stir.
            Roll a shop, an encounter, a stranger, or the spoils of battle.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/encounters"
              className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-[var(--shadow-divine)] transition-transform hover:scale-105"
            >
              Roll an Encounter
            </Link>
            <Link
              to="/shops"
              className="rounded-md border border-border bg-secondary px-5 py-2.5 font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              Generate a Shop
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-divine)]"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-secondary p-2 text-primary transition-colors group-hover:bg-primary/15">
                  <t.icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl tracking-wide">{t.title}</h2>
              </div>
              <p className="mt-3 font-serif text-base italic text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
