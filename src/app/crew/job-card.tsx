"use client";

import { useState, useTransition } from "react";
import StatusBadge from "@/components/status-badge";
import { currency } from "@/lib/format";
import type { CrewJob } from "@/lib/services/jobs";
import {
  clockInAction,
  clockOutAction,
  completeJobAction,
  type CrewActionResult,
} from "./actions";

export default function JobCard({ job }: { job: CrewJob }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const clockedIn = Boolean(job.openClockInAt);
  const finished = job.status === "completed" || job.status === "cancelled";

  function perform(action: (jobId: string) => Promise<CrewActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action(job.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="rounded-2xl border border-mist bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{job.address}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {job.serviceName} · {currency.format(job.quotedPrice)}
            {job.laborMinutes > 0 && ` · ${job.laborMinutes} min logged`}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {clockedIn && (
        <p className="mt-3 text-sm text-fern">
          Clocked in at{" "}
          {new Date(job.openClockInAt!).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}

      {!finished && (
        <div className="mt-4 flex flex-wrap gap-2">
          {clockedIn ? (
            <button
              onClick={() => perform(clockOutAction)}
              disabled={pending}
              className="rounded-xl bg-pine px-4 py-2 text-sm font-medium text-canvas transition hover:bg-pine-deep disabled:opacity-50"
            >
              Clock out
            </button>
          ) : (
            <button
              onClick={() => perform(clockInAction)}
              disabled={pending}
              className="rounded-xl bg-fern px-4 py-2 text-sm font-medium text-canvas transition hover:bg-pine disabled:opacity-50"
            >
              Clock in
            </button>
          )}
          <button
            onClick={() => perform(completeJobAction)}
            disabled={pending || clockedIn}
            title={clockedIn ? "Clock out before completing the job" : undefined}
            className="rounded-xl border border-pine px-4 py-2 text-sm font-medium text-pine transition hover:bg-pine hover:text-canvas disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark completed
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </li>
  );
}
