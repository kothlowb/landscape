import type { Metadata } from "next";
import Link from "next/link";
import { addDays, fromISODate, toISODate } from "@/lib/dates";
import { getJobsForDate } from "@/lib/services/jobs";
import JobCard from "./job-card";

export const metadata: Metadata = {
  title: "Crew — Landscape Lawn Co.",
};

function parseDateParam(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
  return toISODate(new Date());
}

export default async function CrewPage(props: PageProps<"/crew">) {
  const searchParams = await props.searchParams;
  const date = parseDateParam(searchParams.date);
  const today = toISODate(new Date());
  const { configured, jobs } = await getJobsForDate(date);

  const heading = fromISODate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
          Crew view
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-pine">{heading}</h1>
          <nav className="flex items-center gap-1">
            <Link
              href={`/crew?date=${addDays(date, -1)}`}
              aria-label="Previous day"
              className="rounded-lg border border-mist bg-card px-3 py-1.5 text-ink transition hover:border-fern"
            >
              ‹
            </Link>
            {date !== today && (
              <Link
                href="/crew"
                className="rounded-lg border border-mist bg-card px-3 py-1.5 text-sm text-ink transition hover:border-fern"
              >
                Today
              </Link>
            )}
            <Link
              href={`/crew?date=${addDays(date, 1)}`}
              aria-label="Next day"
              className="rounded-lg border border-mist bg-card px-3 py-1.5 text-ink transition hover:border-fern"
            >
              ›
            </Link>
          </nav>
        </div>
      </header>

      {!configured ? (
        <div className="rounded-2xl border border-mist bg-sun/15 p-6 text-ink">
          <p className="font-medium">Database not connected</p>
          <p className="mt-1 text-sm text-ink-soft">
            Copy <code>.env.local.example</code> to <code>.env.local</code> and
            add your Supabase keys to see scheduled jobs here.
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-card p-10 text-center text-ink-soft">
          No jobs scheduled for this day.
        </div>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </ul>
      )}
    </main>
  );
}
