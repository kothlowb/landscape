import type { Metadata } from "next";
import StatusBadge from "@/components/status-badge";
import { fromISODate } from "@/lib/dates";
import { currency } from "@/lib/format";
import {
  getDashboardData,
  HOURLY_LABOR_RATE,
  type DashboardSummary,
} from "@/lib/services/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Landscape Lawn Co.",
};

// Job data changes as crews clock in/out; always render fresh.
export const dynamic = "force-dynamic";

function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    { label: "Jobs this week", value: String(summary.jobsThisWeek) },
    { label: "Revenue (completed)", value: currency.format(summary.completedRevenue) },
    {
      label: "Avg labor per job",
      value:
        summary.avgLaborMinutes !== null ? `${summary.avgLaborMinutes} min` : "—",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-mist bg-card p-5 shadow-sm"
        >
          <p className="text-sm text-ink-soft">{card.label}</p>
          <p className="mt-1 font-display text-3xl text-pine">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const { configured, jobs, summary } = await getDashboardData();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
          Owner dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl text-pine">
          Jobs &amp; margins
        </h1>
      </header>

      {!configured ? (
        <div className="rounded-2xl border border-mist bg-sun/15 p-6 text-ink">
          <p className="font-medium">Database not connected</p>
          <p className="mt-1 text-sm text-ink-soft">
            Copy <code>.env.local.example</code> to <code>.env.local</code> and
            add your Supabase keys to see jobs and revenue here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <SummaryCards summary={summary} />

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-mist bg-card p-10 text-center text-ink-soft">
              No jobs yet — bookings from the customer flow will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-mist bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-mist text-left text-ink-soft">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Address</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Quoted</th>
                    <th className="px-4 py-3 text-right font-medium">Labor</th>
                    <th className="px-4 py-3 text-right font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-mist/60 last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fromISODate(job.scheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="max-w-56 truncate px-4 py-3" title={job.address}>
                        {job.address}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{job.serviceName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {currency.format(job.quotedPrice)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {job.laborMinutes > 0 ? `${job.laborMinutes} min` : "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          job.margin === null
                            ? "text-ink-soft"
                            : job.margin >= 0
                              ? "text-fern"
                              : "text-red-700"
                        }`}
                      >
                        {job.margin !== null ? currency.format(job.margin) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-ink-soft">
            Margin = quoted price − (labor minutes ÷ 60 ×{" "}
            {currency.format(HOURLY_LABOR_RATE)}/hr labor rate).
          </p>
        </div>
      )}
    </main>
  );
}
