"use client";

import { useEffect, useState } from "react";
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
};

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
        throw new Error("Nem sikerült menteni a státuszt.");
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

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Job Board</h1>
          <p className="mt-2 text-sm text-slate-400">
            Húzd át az állásokat a kívánt státusz oszlopba.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              Mentés...
            </div>
          )}

          <a
            href="/jobs/new"
            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
          >
            Új állás
          </a>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    </main>
  );
}

function Column({ status, jobs }: { status: string; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-4 transition ${
        isOver
          ? "border-blue-400/40 bg-white/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{status}</h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
          {jobs.length}
        </span>
      </div>

      <div className="min-h-[200px] space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
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
      className={`rounded-xl border border-white/10 bg-slate-900 p-4 transition ${
        isDragging ? "z-50 cursor-grabbing opacity-70" : "cursor-grab"
      }`}
    >
      <a href={`/jobs/${job.id}`} className="block">
        <p className="font-medium text-white">{job.title}</p>
        <p className="mt-1 text-sm text-slate-400">{job.company}</p>
      </a>
    </div>
  );
}