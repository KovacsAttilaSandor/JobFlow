"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statuses = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "OnHold",
] as const;

type Props = {
  jobId: string;
  currentStatus: string;
};

function getStatusButtonClasses(item: string, active: boolean) {
  const base =
    "rounded-2xl border px-3 py-2 text-xs font-medium transition";
  if (!active) {
    return `${base} border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground`;
  }

  switch (item) {
    case "Saved":
      return `${base} border-yellow-400/20 bg-yellow-500/15 text-yellow-300`;
    case "Applied":
      return `${base} border-blue-400/20 bg-blue-500/15 text-blue-300`;
    case "Interviewing":
      return `${base} border-purple-400/20 bg-purple-500/15 text-purple-300`;
    case "Offer":
      return `${base} border-green-400/20 bg-green-500/15 text-green-300`;
    case "Rejected":
      return `${base} border-red-400/20 bg-red-500/15 text-red-300`;
    case "OnHold":
      return `${base} border-border bg-surface-2 text-muted`;
    default:
      return `${base} border-border bg-surface-3 text-foreground`;
  }
}

export default function JobDetailActions({
  jobId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;

    const previous = status;
    setStatus(newStatus);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Nem sikerült menteni a státuszt.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus(previous);
      alert("Nem sikerült menteni a státuszt.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd ezt az állást?"
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Nem sikerült törölni az állást.");
      }

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nem sikerült törölni az állást.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface-2/60 p-5 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
            Műveletek
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            Állás kezelése
          </h3>
          <p className="mt-1 text-sm text-muted-2">
            Státusz váltása, szerkesztés és törlés.
          </p>
        </div>

        {isSaving && (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            Mentés...
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {statuses.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleStatusChange(item)}
            disabled={isSaving}
            className={getStatusButtonClasses(item, status === item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/jobs/${jobId}/edit`}
          className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-surface-2"
        >
          Állás szerkesztése
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
        >
          {isDeleting ? "Törlés..." : "Állás törlése"}
        </button>
      </div>
    </div>
  );
}