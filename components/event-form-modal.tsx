"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type EventType = "Interview" | "TaskDeadline" | "FollowUp" | "Other";

export type EventDto = {
  id: string;
  jobId: string | null;
  type: EventType;
  title: string;
  description: string | null;
  location: string | null;
  meetingLink: string | null;
  startTime: string;
  endTime: string | null;
  reminderMinutesBefore: number | null;
  job?: { id: string; title: string; company: string } | null;
};

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function EventFormModal({
  open,
  onClose,
  jobId,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  jobId?: string;
  initial?: Partial<EventDto> | null;
  onSaved: (event: EventDto) => void;
}) {
  const mode = initial?.id ? "edit" : "create";

  const [type, setType] = useState<EventType>("Interview");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(toLocalInputValue(new Date()));
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setType((initial?.type as EventType) || "Interview");
    setTitle(safeString(initial?.title));
    setStartTime(
      initial?.startTime
        ? toLocalInputValue(new Date(initial.startTime))
        : toLocalInputValue(new Date())
    );
    setEndTime(initial?.endTime ? toLocalInputValue(new Date(initial.endTime)) : "");
    setDescription(safeString(initial?.description));
    setLocation(safeString(initial?.location));
    setMeetingLink(safeString(initial?.meetingLink));
    setReminderMinutesBefore(
      typeof initial?.reminderMinutesBefore === "number"
        ? String(initial.reminderMinutesBefore)
        : ""
    );
    setError("");
  }, [open, initial]);

  const titleLabel = useMemo(() => {
    return mode === "edit" ? "Edit event" : "New event";
  }, [mode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        jobId: jobId ?? initial?.jobId ?? null,
        type,
        title,
        description,
        location,
        meetingLink: meetingLink.trim() ? meetingLink.trim() : null,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : null,
        reminderMinutesBefore: reminderMinutesBefore
          ? Number(reminderMinutesBefore)
          : null,
      };

      const res = await fetch(
        mode === "edit" ? `/api/events/${initial?.id}` : "/api/events",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save event.");
        return;
      }

      onSaved(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${initial.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to delete event.");
        return;
      }
      onClose();
      // parent will refresh list via router.refresh() or local state update
    } catch (err) {
      console.error(err);
      setError("Something went wrong while deleting.");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative flex min-h-[100dvh] items-center justify-center p-4 pointer-events-none sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-background text-foreground shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="border-b border-border bg-surface px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
                Events
              </p>
              <h3 id="event-modal-title" className="mt-2 text-xl font-semibold">
                {titleLabel}
              </h3>
              <p className="mt-1 text-sm text-muted-2">
                Log an interview, follow-up, or deadline.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-muted">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="Interview">Interview</option>
                <option value="FollowUp">FollowUp</option>
                <option value="TaskDeadline">TaskDeadline</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Reminder (minutes before)
              </label>
              <input
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 30"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Technical interview – round 1"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Start
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                End (optional)
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Location (optional)
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Office / Zoom"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Meeting link (optional)
              </label>
              <input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-primary/25"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-muted">
                Description / notes (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-primary/25"
                placeholder="Agenda, action items, questions..."
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {mode === "edit" ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-red-500 disabled:opacity-60"
              >
                Delete
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

