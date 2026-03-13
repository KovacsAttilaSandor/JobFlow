"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "OnHold",
];

type Props = {
  jobId: string;
  currentStatus: string;
};

export default function JobDetailActions({
  jobId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) return;

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
      setStatus(currentStatus);
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
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl font-semibold">Műveletek</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Státusz módosítása
            </label>

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {isSaving && (
              <p className="mt-2 text-xs text-slate-400">Mentés...</p>
            )}
          </div>

          <a
            href={`/jobs/${jobId}/edit`}
            className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
          >
            Állás szerkesztése
          </a>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
          >
            {isDeleting ? "Törlés..." : "Állás törlése"}
          </button>
        </div>
      </div>
    </div>
  );
}