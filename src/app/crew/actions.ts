"use server";

import { revalidatePath } from "next/cache";
import { clockIn, clockOut, completeJob } from "@/lib/services/jobs";

export type CrewActionResult = { ok: true } | { ok: false; error: string };

async function run(fn: () => Promise<void>): Promise<CrewActionResult> {
  try {
    await fn();
    revalidatePath("/crew");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}

export async function clockInAction(jobId: string): Promise<CrewActionResult> {
  return run(() => clockIn(jobId));
}

export async function clockOutAction(jobId: string): Promise<CrewActionResult> {
  return run(() => clockOut(jobId));
}

export async function completeJobAction(jobId: string): Promise<CrewActionResult> {
  return run(() => completeJob(jobId));
}
