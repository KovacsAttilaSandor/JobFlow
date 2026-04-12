"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const SEARCH_DEBOUNCE_MS = 420;

type Props = {
  statusOptions: string[];
  locationOptions: string[];
  sourceOptions: string[];
  tagOptions: string[];
};

type FilterOption = {
  value: string;
  label: string;
  description?: string;
  leading?: React.ReactNode;
};

const STATUS_DOT: Record<string, string> = {
  Saved: "bg-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]",
  Applied: "bg-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]",
  Interviewing: "bg-violet-400 shadow-[0_0_0_1px_rgba(167,139,250,0.35)]",
  Offer: "bg-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.35)]",
  Rejected: "bg-rose-400 shadow-[0_0_0_1px_rgba(251,113,133,0.35)]",
  OnHold: "bg-slate-400 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]",
};

function StatusDot({ status }: { status: string }) {
  const cls = STATUS_DOT[status] ?? "bg-muted-2";
  return <span className={`inline-block size-2 shrink-0 rounded-full ${cls}`} />;
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-4 shrink-0 text-muted-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.18 3.18a.75.75 0 11-1.06 1.06l-3.18-3.18A7 7 0 012 9z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

function useDropdownPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  open: boolean
) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pad = 8;
      const maxW = Math.max(r.width, 260);
      let left = r.left;
      if (left + maxW > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - maxW - pad);
      }
      setPos({
        top: r.bottom + pad,
        left,
        width: maxW,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, triggerRef]);

  return pos;
}

type FilterMenuProps = {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPick: (value: string) => void;
  buttonClassName?: string;
};

function FilterMenu({
  id,
  label,
  value,
  options,
  open,
  onOpen,
  onClose,
  onPick,
  buttonClassName,
}: FilterMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const pos = useDropdownPosition(triggerRef, open && mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onClose();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const panel =
    open && mounted ? (
      createPortal(
        <div
          ref={panelRef}
          id={`${id}-listbox`}
          role="listbox"
          className="fixed z-[160] max-h-[min(20rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border border-border bg-background py-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:ring-white/10"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onPick(opt.value);
                  onClose();
                }}
                className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary/12 text-foreground"
                    : "text-foreground hover:bg-surface-2"
                }`}
              >
                {opt.leading ? (
                  <span className="mt-0.5 shrink-0">{opt.leading}</span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{opt.label}</span>
                  {opt.description ? (
                    <span className="mt-0.5 block text-xs leading-snug text-muted-2">
                      {opt.description}
                    </span>
                  ) : null}
                </span>
                {isActive ? (
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="size-4 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )
    ) : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-2">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        onClick={() => (open ? onClose() : onOpen())}
        className={
          buttonClassName ??
          "flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm outline-none transition hover:border-primary/25 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-primary/30"
        }
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected?.leading}
          <span className="truncate">{selected?.label ?? value}</span>
        </span>
        <ChevronDown open={open} />
      </button>
      {panel}
    </div>
  );
}

export default function JobsFilters({
  statusOptions,
  locationOptions,
  sourceOptions,
  tagOptions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstSearchEffect = useRef(true);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qParam = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status") ?? "All";
  const locationParam = searchParams.get("location") ?? "All";
  const sourceParam = searchParams.get("source") ?? "All";
  const tagParam = searchParams.get("tag") ?? "All";
  const sortParam = searchParams.get("sort") ?? "newest";

  const [q, setQ] = useState(qParam);
  const [status, setStatus] = useState(statusParam);
  const [location, setLocation] = useState(locationParam);
  const [source, setSource] = useState(sourceParam);
  const [tag, setTag] = useState(tagParam);
  const [sort, setSort] = useState(sortParam);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /* Keep selects in sync with URL (pagination, back/forward, shared links).
   * Search text `q` is synced only when `qParam` changes — not on every render —
   * so we never clobber typing while the debounced URL is still catching up. */
  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    setStatus(statusParam);
    setLocation(locationParam);
    setSource(sourceParam);
    setTag(tagParam);
    setSort(sortParam);
  }, [statusParam, locationParam, sourceParam, tagParam, sortParam]);

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

  const pushQuery = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname]
  );

  const buildParams = useCallback(
    (overrides: {
      q?: string;
      status?: string;
      location?: string;
      source?: string;
      tag?: string;
      sort?: string;
      resetPage?: boolean;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      const nextQ = overrides.q ?? q;
      const nextStatus = overrides.status ?? status;
      const nextLocation = overrides.location ?? location;
      const nextSource = overrides.source ?? source;
      const nextTag = overrides.tag ?? tag;
      const nextSort = overrides.sort ?? sort;

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

      if (overrides.resetPage) params.set("page", "1");

      return params;
    },
    [searchParams, q, status, location, source, tag, sort]
  );

  const updateUrl = useCallback(
    (
      next: {
        q?: string;
        status?: string;
        location?: string;
        source?: string;
        tag?: string;
        sort?: string;
      },
      options?: { resetPage?: boolean }
    ) => {
      const params = buildParams({ ...next, resetPage: options?.resetPage });
      pushQuery(params);
    },
    [buildParams, pushQuery]
  );

  const flushSearchNow = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    updateUrl({ q }, { resetPage: true });
  }, [updateUrl, q]);

  useEffect(() => {
    if (isFirstSearchEffect.current) {
      isFirstSearchEffect.current = false;
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null;
      updateUrl({ q }, { resetPage: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [q, updateUrl]);

  function resetFilters() {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    setQ("");
    setStatus("All");
    setLocation("All");
    setSource("All");
    setTag("All");
    setSort("newest");
    router.replace(pathname, { scroll: false });
  }

  const statusFilterOptions: FilterOption[] = useMemo(() => {
    const rest = [...statusOptions].sort();
    return [
      {
        value: "All",
        label: "All statuses",
        description: "Show every pipeline stage",
        leading: <span className="inline-block size-2 shrink-0 rounded-full bg-muted-2" />,
      },
      ...rest.map((s) => ({
        value: s,
        label: s,
        leading: <StatusDot status={s} />,
      })),
    ];
  }, [statusOptions]);

  const sortOptions: FilterOption[] = useMemo(
    () => [
      {
        value: "newest",
        label: "Newest first",
        description: "Recently added or updated at the top",
      },
      {
        value: "oldest",
        label: "Oldest first",
        description: "First saved jobs appear first",
      },
      {
        value: "title-asc",
        label: "Title A–Z",
        description: "Alphabetical by job title",
      },
      {
        value: "company-asc",
        label: "Company A–Z",
        description: "Alphabetical by employer",
      },
      {
        value: "status-asc",
        label: "By status",
        description: "Group roughly by pipeline stage name",
      },
    ],
    []
  );

  const locationFilterOptions: FilterOption[] = useMemo(() => {
    const rest = [...locationOptions].sort((a, b) => a.localeCompare(b));
    return [
      { value: "All", label: "Any location", description: "Do not filter by place" },
      ...rest.map((loc) => ({
        value: loc,
        label: loc,
      })),
    ];
  }, [locationOptions]);

  const sourceFilterOptions: FilterOption[] = useMemo(() => {
    const rest = [...sourceOptions].sort((a, b) => a.localeCompare(b));
    return [
      { value: "All", label: "Any source", description: "LinkedIn, site, referral…" },
      ...rest.map((src) => ({
        value: src,
        label: src,
      })),
    ];
  }, [sourceOptions]);

  const tagFilterOptions: FilterOption[] = useMemo(() => {
    const rest = [...tagOptions].sort((a, b) => a.localeCompare(b));
    return [
      { value: "All", label: "All tags", description: "Jobs with any tag" },
      ...rest.map((t) => ({
        value: t,
        label: t,
        leading: (
          <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Tag
          </span>
        ),
      })),
    ];
  }, [tagOptions]);

  return (
    <section className="overflow-visible rounded-[28px] border border-border bg-gradient-to-br from-surface via-surface-2/80 to-surface p-6 shadow-lg ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Search & filters</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-2">
            Find jobs by keywords (including tags), narrow by pipeline and metadata, then
            sort the list.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted shadow-sm backdrop-blur-sm">
            <span className="text-muted-2">Active</span>{" "}
            <span className="tabular-nums text-foreground">{activeFiltersCount}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="jobs-search" className="sr-only">
          Search jobs
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-2" />
          <input
            id="jobs-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                flushSearchNow();
              }
            }}
            placeholder="Search title, company, location, source, description, tags…"
            className="w-full rounded-2xl border border-border bg-background py-3.5 pl-12 pr-24 text-[15px] text-foreground shadow-inner shadow-black/[0.03] outline-none ring-1 ring-black/[0.04] transition placeholder:text-muted-2 focus:border-primary/40 focus:ring-2 focus:ring-primary/25 dark:shadow-black/20 dark:ring-white/[0.06]"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block">
            <kbd className="rounded-lg border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-2">
              Enter
            </kbd>
            <span className="ml-1.5 text-[10px] text-muted-2">to run</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-2">
          Results update as you type ({SEARCH_DEBOUNCE_MS}ms). Press{" "}
          <span className="font-medium text-muted">Enter</span> to search immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <FilterMenu
          id="filter-status"
          label="Status"
          value={status}
          options={statusFilterOptions}
          open={openMenu === "status"}
          onOpen={() => setOpenMenu("status")}
          onClose={() => setOpenMenu((m) => (m === "status" ? null : m))}
          onPick={(value) => {
            setStatus(value);
            updateUrl({ status: value }, { resetPage: true });
          }}
        />

        <FilterMenu
          id="filter-location"
          label="Location"
          value={location}
          options={locationFilterOptions}
          open={openMenu === "location"}
          onOpen={() => setOpenMenu("location")}
          onClose={() => setOpenMenu((m) => (m === "location" ? null : m))}
          onPick={(value) => {
            setLocation(value);
            updateUrl({ location: value }, { resetPage: true });
          }}
        />

        <FilterMenu
          id="filter-source"
          label="Source"
          value={source}
          options={sourceFilterOptions}
          open={openMenu === "source"}
          onOpen={() => setOpenMenu("source")}
          onClose={() => setOpenMenu((m) => (m === "source" ? null : m))}
          onPick={(value) => {
            setSource(value);
            updateUrl({ source: value }, { resetPage: true });
          }}
        />

        <FilterMenu
          id="filter-tag"
          label="Tag"
          value={tag}
          options={tagFilterOptions}
          open={openMenu === "tag"}
          onOpen={() => setOpenMenu("tag")}
          onClose={() => setOpenMenu((m) => (m === "tag" ? null : m))}
          onPick={(value) => {
            setTag(value);
            updateUrl({ tag: value }, { resetPage: true });
          }}
        />

        <FilterMenu
          id="filter-sort"
          label="Sort"
          value={sort}
          options={sortOptions}
          open={openMenu === "sort"}
          onOpen={() => setOpenMenu("sort")}
          onClose={() => setOpenMenu((m) => (m === "sort" ? null : m))}
          onPick={(value) => {
            setSort(value);
            updateUrl({ sort: value }, { resetPage: true });
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
        >
          Reset all
        </button>

        <Link
          href="/jobs/board"
          className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2"
        >
          Board view
        </Link>
      </div>
    </section>
  );
}
