import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PageShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-wider text-gradient-gold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl font-serif text-base italic text-muted-foreground sm:text-lg">{subtitle}</p>}
          <div className="divider-laurel mt-4" />
        </div>
        {children}
      </main>
    </div>
  );
}
