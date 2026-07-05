"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Phase 1: everything is open. When auth lands, gate /crew and /dashboard
// behind a session check here (and in a proxy.ts route guard) — the nav
// structure itself doesn't need to change.
const LINKS = [
  { href: "/book", label: "Book" },
  { href: "/crew", label: "Crew" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-mist bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg text-pine">
          Landscape Lawn Co.
        </Link>
        <nav className="flex gap-1">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-pine text-canvas"
                    : "text-ink hover:bg-mist/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
