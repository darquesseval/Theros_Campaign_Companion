import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shops", label: "Shops" },
  { to: "/encounters", label: "Encounters" },
  { to: "/npcs", label: "NPCs" },
  { to: "/loot", label: "Loot" },
  { to: "/search", label: "Search" },
] as const;


export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg tracking-widest text-gradient-gold">THEROS</span>
          <span className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            DM Codex
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV.slice(1).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-primary bg-secondary" }}
              className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
