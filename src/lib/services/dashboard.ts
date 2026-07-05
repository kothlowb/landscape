// Owner dashboard queries and job-costing math (server-side).

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { addDays, toISODate } from "@/lib/dates";
import type { JobStatus } from "@/lib/types";

/** Blended hourly labor cost. TODO(phase-2): move to a settings table. */
export const HOURLY_LABOR_RATE = 35;

export interface DashboardJob {
  id: string;
  scheduledDate: string;
  address: string;
  serviceName: string;
  status: JobStatus;
  quotedPrice: number;
  /** Total recorded labor minutes; 0 when nothing logged yet. */
  laborMinutes: number;
  /** quoted − labor cost. Null until labor has been recorded. */
  margin: number | null;
}

export interface DashboardSummary {
  jobsThisWeek: number;
  /** Sum of quoted_price over completed jobs. */
  completedRevenue: number;
  /** Average labor minutes across jobs with recorded labor; null if none. */
  avgLaborMinutes: number | null;
}

export interface DashboardData {
  configured: boolean;
  jobs: DashboardJob[];
  summary: DashboardSummary;
}

export function calculateMargin(quotedPrice: number, laborMinutes: number): number {
  const laborCost = (laborMinutes / 60) * HOURLY_LABOR_RATE;
  return Math.round((quotedPrice - laborCost) * 100) / 100;
}

interface DashboardJobRow {
  id: string;
  scheduled_date: string;
  status: JobStatus;
  quoted_price: number;
  properties: { address: string } | null;
  services: { name: string } | null;
  job_costs: { labor_minutes: number | null }[];
}

const EMPTY_SUMMARY: DashboardSummary = {
  jobsThisWeek: 0,
  completedRevenue: 0,
  avgLaborMinutes: null,
};

export async function getDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    return { configured: false, jobs: [], summary: EMPTY_SUMMARY };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, scheduled_date, status, quoted_price, properties(address), services(name), job_costs(labor_minutes)"
    )
    .order("scheduled_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load dashboard data (${error.message}).`);
  }

  const rows = (data ?? []) as unknown as DashboardJobRow[];
  const jobs: DashboardJob[] = rows.map((row) => {
    const laborMinutes = row.job_costs.reduce(
      (sum, c) => sum + (c.labor_minutes ?? 0),
      0
    );
    return {
      id: row.id,
      scheduledDate: row.scheduled_date,
      address: row.properties?.address ?? "(unknown address)",
      serviceName: row.services?.name ?? "(unknown service)",
      status: row.status,
      quotedPrice: Number(row.quoted_price),
      laborMinutes,
      margin: laborMinutes > 0 ? calculateMargin(Number(row.quoted_price), laborMinutes) : null,
    };
  });

  // Current calendar week, Monday through Sunday, by scheduled date.
  const today = toISODate(new Date());
  const dayOfWeek = (new Date().getDay() + 6) % 7; // 0 = Monday
  const weekStart = addDays(today, -dayOfWeek);
  const weekEnd = addDays(weekStart, 6);
  const jobsThisWeek = jobs.filter(
    (j) => j.scheduledDate >= weekStart && j.scheduledDate <= weekEnd
  ).length;

  const completed = jobs.filter((j) => j.status === "completed");
  const completedRevenue = completed.reduce((sum, j) => sum + j.quotedPrice, 0);

  const withLabor = jobs.filter((j) => j.laborMinutes > 0);
  const avgLaborMinutes =
    withLabor.length > 0
      ? Math.round(
          withLabor.reduce((sum, j) => sum + j.laborMinutes, 0) / withLabor.length
        )
      : null;

  return {
    configured: true,
    jobs,
    summary: { jobsThisWeek, completedRevenue, avgLaborMinutes },
  };
}
