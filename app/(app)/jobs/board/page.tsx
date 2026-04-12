"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

const statuses = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
] as const;

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  jobUrl?: string | null;
  description?: string | null;
  status: string;
  createdAt?: string;
};

function getColumnTheme(status: string) {
  switch (status) {
    case "Saved":
      return {
        pill: "status-pill status-saved",
        glow: "from-yellow-500/10",
      };
    case "Applied":
      return {
        pill: "status-pill status-applied",
        glow: "from-blue-500/10",
      };
    case "Interviewing":
      return {
        pill: "status-pill status-interviewing",
        glow: "from-purple-500/10",
      };
    case "Offer":
      return {
        pill: "status-pill status-offer",
        glow: "from-green-500/10",
      };
    case "Rejected":
      return {
        pill: "status-pill status-rejected",
        glow: "from-red-500/10",
      };
    default:
      return {
        pill: "status-pill bg-surface-3 text-muted border-border",
        glow: "from-white/5",
      };
  }
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  }

  async function persistStatus(jobId: string, newStatus: string) {
    const previousJobs = jobs;

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    try {
      setIsSaving(true);

      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save status.");
      }
    } catch (error) {
      console.error(error);
      setJobs(previousJobs);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeJobId = active.id as string;
    let targetStatus: string | null = null;

    if (statuses.includes(over.id as (typeof statuses)[number])) {
      targetStatus = over.id as string;
    } else {
      const hoveredJob = jobs.find((job) => job.id === over.id);
      if (hoveredJob) {
        targetStatus = hoveredJob.status;
      }
    }

    if (!targetStatus) return;

    const activeJob = jobs.find((job) => job.id === activeJobId);
    if (!activeJob) return;

    if (activeJob.status === targetStatus) return;

    persistStatus(activeJobId, targetStatus);
  }

  const totalJobs = jobs.length;

  const stats = useMemo(() => {
    return statuses.map((status) => ({
      status,
      count: jobs.filter((job) => job.status === status).length,
    }));
  }, [jobs]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)] px-8 py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Board view
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Job Board
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Drag jobs into the right status column and manage your
                  pipeline in a clear kanban view.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isSaving && (
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                    Saving...
                  </div>
                )}

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  Total jobs: <span className="text-white">{totalJobs}</span>
                </div>

                <Link
                  href="/jobs"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  List view
                </Link>

                <Link
                  href="/jobs/new"
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
                >
                  New job
                </Link>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {stats.map((item) => {
                const theme = getColumnTheme(item.status);

                return (
                  <div
                    key={item.status}
                    className="rounded-3xl border border-white/10 bg-slate-900/30 p-5"
                  >
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 text-xs ${theme.pill}`}
                    >
                      {item.status}
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                      {item.count}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">jobs</p>
                  </div>
                );
              })}
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                {statuses.map((status) => (
                  <Column
                    key={status}
                    status={status}
                    jobs={jobs.filter((job) => job.status === status)}
                  />
                ))}
              </div>
            </DndContext>
          </div>
        </section>
      </div>
    </main>
  );
}

function Column({ status, jobs }: { status: string; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const theme = getColumnTheme(status);

  return (
    <div
      ref={setNodeRef}
      className={`relative overflow-hidden rounded-[28px] border p-4 transition ${
        isOver
          ? "border-blue-400/40 bg-white/10"
          : "border-white/10 bg-slate-900/30"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${theme.glow} to-transparent`}
      />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.pill}`}
            >
              {status}
            </span>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
            {jobs.length}
          </span>
        </div>

        <div className="min-h-[320px] space-y-3">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-500">
              Drop a job here.
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-lg transition ${
        isDragging
          ? "z-50 cursor-grabbing opacity-70 ring-2 ring-blue-400/30"
          : "cursor-grab hover:border-white/20 hover:bg-slate-950/80"
      }`}
    >
      <Link href={`/jobs/${job.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-6 text-white transition group-hover:text-blue-300">
              {job.title}
            </p>

            <p className="mt-1 text-sm text-slate-400">{job.company}</p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-400">
            Drag
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
            {job.location || "No location"}
          </span>

          {job.createdAt && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
              {new Date(job.createdAt).toLocaleDateString("en-US")}
            </span>
          )}
        </div>

        {job.description && (
          <p className="mt-4 line-clamp-3 text-xs leading-6 text-slate-500">
            {job.description}
          </p>
        )}
      </Link>
    </div>
  );
}