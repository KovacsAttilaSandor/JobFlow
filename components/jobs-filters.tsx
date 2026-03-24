"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Props = {
  statusOptions: string[];
  locationOptions: string[];
  sourceOptions: string[];
  tagOptions: string[];
};

export default function JobsFilters({
  statusOptions,
  locationOptions,
  sourceOptions,
  tagOptions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [location, setLocation] = useState(searchParams.get("location") || "All");
  const [source, setSource] = useState(searchParams.get("source") || "All");
  const [tag, setTag] = useState(searchParams.get("tag") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const activeFiltersCount = useMemo(() => {
    return [
      q.trim() !== "",
      status !== "All",
      location !== "All",
      source !== "All",
      tag !== "All",
      sort !== "newest",
    ].filter(Boolean).length;
  }, [q, status, location, source, tag, sort]);

  function updateUrl(
    next: {
      q?: string;
      status?: string;
      location?: string;
      source?: string;
      tag?: string;
      sort?: string;
    },
    options?: { resetPage?: boolean }
  ) {
    const params = new URLSearchParams(searchParams.toString());

    const nextQ = next.q ?? q;
    const nextStatus = next.status ?? status;
    const nextLocation = next.location ?? location;
    const nextSource = next.source ?? source;
    const nextTag = next.tag ?? tag;
    const nextSort = next.sort ?? sort;

    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");

    if (nextStatus !== "All") params.set("status", nextStatus);
    else params.delete("status");

    if (nextLocation !== "All") params.set("location", nextLocation);
    else params.delete("location");

    if (nextSource !== "All") params.set("source", nextSource);
    else params.delete("source");

    if (nextTag !== "All") params.set("tag", nextTag);
    else params.delete("tag");

    if (nextSort !== "newest") params.set("sort", nextSort);
    else params.delete("sort");

    if (options?.resetPage) {
      params.set("page", "1");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      updateUrl({ q }, { resetPage: true });
    }, 350);

    return () => clearTimeout(timeout);
  }, [q]);

  function resetFilters() {
    setQ("");
    setStatus("All");
    setLocation("All");
    setSource("All");
    setTag("All");
    setSort("newest");
    router.replace(pathname, { scroll: false });
  }

  return (
    <section className="rounded-3xl border border-border bg-surface-2/60 p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Keresés és szűrés</h2>
          <p className="mt-1 text-sm text-muted-2">
            Élő keresés, dinamikus szűrés és rendezés.
          </p>
        </div>

        <div className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          Aktív filterek: {activeFiltersCount}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        <div className="xl:col-span-2">
          <label className="mb-2 block text-sm text-muted">Keresés</label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pozíció, cég, helyszín, forrás..."
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-primary/25"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted">Státusz</label>
          <select
            value={status}
            onChange={(e) => {
              const value = e.target.value;
              setStatus(value);
              updateUrl({ status: value }, { resetPage: true });
            }}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          >
            <option value="All" style={{ backgroundColor: "white", color: "black" }}>Összes</option>
            {statusOptions.map((item) => (
              <option key={item} value={item} style={{ backgroundColor: "white", color: "black" }}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted">Helyszín</label>
          <select
            value={location}
            onChange={(e) => {
              const value = e.target.value;
              setLocation(value);
              updateUrl({ location: value }, { resetPage: true });
            }}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          >
            <option value="All" style={{ backgroundColor: "white", color: "black" }}>Összes</option>
            {locationOptions.map((item) => (
              <option key={item} value={item} style={{ backgroundColor: "white", color: "black" }}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted">Forrás</label>
          <select
            value={source}
            onChange={(e) => {
              const value = e.target.value;
              setSource(value);
              updateUrl({ source: value }, { resetPage: true });
            }}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          >
            <option value="All" style={{ backgroundColor: "white", color: "black" }}>Összes</option>
            {sourceOptions.map((item) => (
              <option key={item} value={item} style={{ backgroundColor: "white", color: "black" }}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted">Tag</label>
          <select
            value={tag}
            onChange={(e) => {
              const value = e.target.value;
              setTag(value);
              updateUrl({ tag: value }, { resetPage: true });
            }}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          >
            <option value="All" style={{ backgroundColor: "white", color: "black" }}>Összes</option>
            {tagOptions.map((item) => (
              <option key={item} value={item} style={{ backgroundColor: "white", color: "black" }}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-muted">Rendezés</label>
          <select
            value={sort}
            onChange={(e) => {
              const value = e.target.value;
              setSort(value);
              updateUrl({ sort: value }, { resetPage: true });
            }}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          >
            <option value="newest" style={{ backgroundColor: "white", color: "black" }}>Legújabb elöl</option>
            <option value="oldest" style={{ backgroundColor: "white", color: "black" }}>Legrégebbi elöl</option>
            <option value="title-asc" style={{ backgroundColor: "white", color: "black" }}>Pozíció A–Z</option>
            <option value="company-asc" style={{ backgroundColor: "white", color: "black" }}>Cég A–Z</option>
            <option value="status-asc" style={{ backgroundColor: "white", color: "black" }}>Státusz szerint</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
        >
          Reset
        </button>

        <Link
          href="/jobs/board"
          className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
        >
          Board nézet
        </Link>
      </div>
    </section>
  );
}