"use client";

import { useEffect, useMemo, useState } from "react";
import EventFormModal, { EventDto } from "@/components/event-form-modal";
import Link from "next/link";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfCalendarGrid(date: Date) {
  const first = startOfMonth(date);
  const day = (first.getDay() + 6) % 7; // Monday=0
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - day);
  gridStart.setHours(0, 0, 0, 0);
  return gridStart;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(
    date
  );
}

function getEventClasses(type: string) {
  switch (type) {
    case "Interview":
      return "border-purple-400/20 bg-purple-500/10 text-purple-300";
    case "FollowUp":
      return "border-blue-400/20 bg-blue-500/10 text-blue-300";
    case "TaskDeadline":
      return "border-orange-400/20 bg-orange-500/10 text-orange-300";
    case "Other":
      return "border-slate-400/20 bg-slate-500/10 text-slate-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

export default function EventsPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<EventDto> | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const from = startOfCalendarGrid(month);
      const to = addDays(from, 42);
      const res = await fetch(
        `/api/events?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(
          to.toISOString()
        )}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Nem sikerült betölteni az eventeket.");
        return;
      }
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Hiba történt az eventek betöltése közben.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const gridStart = useMemo(() => startOfCalendarGrid(month), [month]);
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)), [
    gridStart,
  ]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventDto[]>();
    for (const ev of events) {
      const d = new Date(ev.startTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, [...(map.get(key) || []), ev]);
    }
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    const key = `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`;
    const list = eventsByDay.get(key) || [];
    return [...list].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [eventsByDay, selectedDay]);

  function changeMonth(delta: number) {
    const next = new Date(month);
    next.setMonth(month.getMonth() + delta);
    setMonth(startOfMonth(next));
  }

  async function deleteEvent(id: string) {
    const confirmed = window.confirm("Biztosan törölni szeretnéd ezt az eventet?");
    if (!confirmed) return;

    const previous = events;
    setEvents((prev) => prev.filter((e) => e.id !== id));

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
    } catch (err) {
      console.error(err);
      setEvents(previous);
      alert("Nem sikerült törölni az eventet.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)] px-8 py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Events
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Naptár és eventek
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Interjúk, follow-upok és határidők átláthatóan, egy helyen.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setOpen(true);
                  }}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:opacity-90"
                >
                  + Új event
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Naptár
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {formatMonthTitle(month)}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setMonth(startOfMonth(now));
                      setSelectedDay(now);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    Ma
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-slate-400">
                {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
                  <div key={d} className="px-1 py-1 text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {days.map((d) => {
                  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                  const count = eventsByDay.get(key)?.length || 0;
                  const inMonth = d.getMonth() === month.getMonth();
                  const isSelected = sameDay(d, selectedDay);
                  const isToday = sameDay(d, new Date());

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-blue-400/40 bg-white/10"
                          : "border-white/10 bg-slate-950/40 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            inMonth ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {d.getDate()}
                        </span>
                        {isToday && (
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        )}
                      </div>

                      {count > 0 && (
                        <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                          {count} event
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {loading && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                  Betöltés...
                </div>
              )}
              {error && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-white/10 bg-slate-900/30 p-6 xl:sticky xl:top-24">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Kiválasztott nap
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {new Intl.DateTimeFormat("hu-HU", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(selectedDay)}
                </h2>

                <div className="mt-5 space-y-3">
                  {selectedEvents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                      Nincs event erre a napra.
                    </div>
                  ) : (
                    selectedEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-white">{ev.title}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(ev.startTime).toLocaleString("hu-HU")}
                            </p>
                            {ev.job ? (
                              <Link
                                href={`/jobs/${ev.job.id}`}
                                className="mt-2 inline-block text-xs text-blue-300 hover:text-blue-200"
                              >
                                {ev.job.company} • {ev.job.title}
                              </Link>
                            ) : null}
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] ${getEventClasses(
                              ev.type
                            )}`}
                          >
                            {ev.type}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`/api/events/${ev.id}/ics`}
                            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-blue-300 transition hover:bg-white/10"
                          >
                            ICS
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(ev);
                              setOpen(true);
                            }}
                            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                          >
                            Szerkesztés
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(ev.id)}
                            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/15"
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>

      <EventFormModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        onSaved={(ev) => {
          setEvents((prev) => {
            const exists = prev.some((e) => e.id === ev.id);
            return exists ? prev.map((e) => (e.id === ev.id ? ev : e)) : [...prev, ev];
          });
        }}
      />
    </main>
  );
}

