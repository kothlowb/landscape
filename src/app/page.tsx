import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
          Summer bookings open
        </p>
        <h1 className="mt-4 font-display text-5xl text-pine sm:text-6xl">
          Your lawn, immaculately kept
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          Instant quotes from property records — no site visit, no phone tag.
          Pick a day, and our crew handles the rest.
        </p>
        <Link
          href="/book"
          className="mt-10 inline-block rounded-xl bg-gold px-8 py-4 font-medium text-pine-deep shadow-sm transition hover:bg-gold-bright"
        >
          Get an instant quote
        </Link>
        <p className="mt-4 text-sm text-ink-soft">
          Takes about a minute · No payment required
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-ink-soft">
          Internal tools
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/crew"
            className="rounded-2xl border border-mist bg-card p-6 shadow-sm transition hover:border-fern"
          >
            <h2 className="font-display text-xl text-pine">Crew view</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Today&apos;s jobs, clock in and out, mark work completed.
            </p>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-mist bg-card p-6 shadow-sm transition hover:border-fern"
          >
            <h2 className="font-display text-xl text-pine">Owner dashboard</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Jobs, revenue, labor minutes, and per-job margins.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
