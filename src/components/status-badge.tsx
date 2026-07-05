import type { JobStatus } from "@/lib/types";

const STATUS_STYLES: Record<JobStatus, string> = {
  requested: "bg-sun/25 text-ink",
  scheduled: "bg-sage/40 text-pine-deep",
  in_progress: "bg-fern/20 text-fern",
  completed: "bg-pine text-canvas",
  cancelled: "bg-mist text-ink-soft",
};

const STATUS_LABELS: Record<JobStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
