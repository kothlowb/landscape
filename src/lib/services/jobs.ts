// Job queries and crew operations (server-side).

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { JobCost, JobStatus } from "@/lib/types";

export interface CrewJob {
  id: string;
  address: string;
  serviceName: string;
  scheduledDate: string;
  status: JobStatus;
  quotedPrice: number;
  /** ISO timestamp of the currently open work session, if clocked in. */
  openClockInAt: string | null;
  /** Total labor minutes across closed work sessions. */
  laborMinutes: number;
}

export interface CrewJobsResult {
  configured: boolean;
  jobs: CrewJob[];
}

interface JobRow {
  id: string;
  scheduled_date: string;
  status: JobStatus;
  quoted_price: number;
  properties: { address: string } | null;
  services: { name: string } | null;
  job_costs: JobCost[];
}

export async function getJobsForDate(date: string): Promise<CrewJobsResult> {
  if (!isSupabaseConfigured()) {
    return { configured: false, jobs: [] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, scheduled_date, status, quoted_price, properties(address), services(name), job_costs(*)"
    )
    .eq("scheduled_date", date)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load jobs (${error.message}).`);
  }

  const rows = (data ?? []) as unknown as JobRow[];
  return {
    configured: true,
    jobs: rows.map((row) => {
      const openSession = row.job_costs.find(
        (c) => c.clock_in_at && !c.clock_out_at
      );
      const laborMinutes = row.job_costs.reduce(
        (sum, c) => sum + (c.labor_minutes ?? 0),
        0
      );
      return {
        id: row.id,
        address: row.properties?.address ?? "(unknown address)",
        serviceName: row.services?.name ?? "(unknown service)",
        scheduledDate: row.scheduled_date,
        status: row.status,
        quotedPrice: Number(row.quoted_price),
        openClockInAt: openSession?.clock_in_at ?? null,
        laborMinutes,
      };
    }),
  };
}

export async function clockIn(jobId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("job_costs").insert({
    job_id: jobId,
    clock_in_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Could not clock in (${error.message}).`);

  // Reflect that work has started; ignore if the status update races.
  await supabase
    .from("jobs")
    .update({ status: "in_progress" })
    .eq("id", jobId)
    .in("status", ["requested", "scheduled"]);
}

export async function clockOut(jobId: string): Promise<void> {
  const supabase = await createClient();

  const { data: open, error: findError } = await supabase
    .from("job_costs")
    .select("*")
    .eq("job_id", jobId)
    .is("clock_out_at", null)
    .not("clock_in_at", "is", null)
    .order("clock_in_at", { ascending: false })
    .limit(1)
    .maybeSingle<JobCost>();
  if (findError) throw new Error(`Could not clock out (${findError.message}).`);
  if (!open?.clock_in_at) throw new Error("No open work session to clock out of.");

  const clockOutAt = new Date();
  const minutes = Math.max(
    1,
    Math.round((clockOutAt.getTime() - new Date(open.clock_in_at).getTime()) / 60_000)
  );

  const { error } = await supabase
    .from("job_costs")
    .update({
      clock_out_at: clockOutAt.toISOString(),
      labor_minutes: minutes,
    })
    .eq("id", open.id);
  if (error) throw new Error(`Could not clock out (${error.message}).`);
}

export async function completeJob(jobId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .update({ status: "completed" })
    .eq("id", jobId);
  if (error) throw new Error(`Could not complete the job (${error.message}).`);
}
