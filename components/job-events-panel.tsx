"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EventFormModal, { EventDto } from "./event-form-modal";

function getEventClasses(type: string) {
  switch (type) {
    case "Interview":
      return "bg-purple-500/15 text-purple-300 border-purple-400/20";
    case "FollowUp":
      return "bg-blue-500/15 text-blue-300 border-blue-400/20";
    case "TaskDeadline":
      return "bg-orange-500/15 text-orange-300 border-orange-400/20";
    case "Other":
      return "bg-slate-500/15 text-slate-300 border-slate-400/20";
    default:
      return "bg-white/10 text-slate-300 border-white/10";
  }
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function JobEventsPanel({
  jobId,
  initialEvents,
}: {
  jobId: string;
  initialEvents: EventDto[];
}) {
  const router = useRouter();
  const [events, setEvents] = useState<EventDto[]>(initialEvents);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<EventDto> | null>(null);

  const sorted = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events]);

  function upsert(event: EventDto) {
    setEvents((prev) => {
      const existing = prev.find((e) => e.id === event.id);
      if (existing) return prev.map((e) => (e.id === event.id ? event : e));
      return [...prev, event];
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;

    const previous = events;
    setEvents((prev) => prev.filter((e) => e.id !== id));

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      setEvents(previous);
      alert("Failed to delete the event.");
    }
  }

  const nextEvents = useMemo(() => {
    const now = Date.now();
    return sorted.filter((e) => new Date(e.startTime).getTime() >= now);
  }, [sorted]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Related events</h2>
          <p className="mt-1 text-sm text-slate-400">
            Interviews, follow-ups, and deadlines for this job.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90"
        >
          + New event
        </button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
            No events linked to this job yet.
          </div>
        ) : (
          sorted.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatDateTime(event.startTime)}
                    {event.endTime ? ` – ${formatDateTime(event.endTime)}` : ""}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getEventClasses(
                    event.type
                  )}`}
                >
                  {event.type}
                </span>
              </div>

              {(event.location || event.meetingLink || event.reminderMinutesBefore) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  {event.location && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Location: {event.location}
                    </span>
                  )}
                  {typeof event.reminderMinutesBefore === "number" && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Reminder: {event.reminderMinutesBefore} min
                    </span>
                  )}
                  <a
                    href={`/api/events/${event.id}/ics`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-blue-300 hover:text-blue-200"
                  >
                    Download ICS
                  </a>
                </div>
              )}

              {event.meetingLink && (
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block break-all text-sm text-blue-300 underline underline-offset-4"
                >
                  {event.meetingLink}
                </a>
              )}

              {event.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {event.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(event);
                    setOpen(true);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/15"
                >
                  Delete
                </button>

                {nextEvents[0]?.id === event.id && (
                  <span className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                    Next up
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <EventFormModal
        open={open}
        onClose={() => setOpen(false)}
        jobId={jobId}
        initial={editing}
        onSaved={(event) => upsert(event)}
      />
    </section>
  );
}

