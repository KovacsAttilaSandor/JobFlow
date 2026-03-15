"use client";

import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

export default function DashboardNavbar() {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isJobs =
    pathname === "/jobs" || pathname.startsWith("/jobs/");
  const isNewJob = pathname === "/jobs/new";

  const base =
    "rounded-xl px-3 py-2 text-sm transition";

  const isBoard = pathname === "/jobs/board"

  const isSettings = pathname === "/settings"

  const active =
    "bg-white/10 text-white";

  const inactive =
    "text-slate-300 hover:bg-white/5 hover:text-white";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <div className="flex items-center gap-8">
          <a
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-white"
          >
            JobFlow
          </a>

          <nav className="hidden items-center gap-2 md:flex">

            <a
              href="/dashboard"
              className={`${base} ${isDashboard ? active : inactive
                }`}
            >
              Dashboard
            </a>

            <a
              href="/jobs"
              className={`${base} ${isJobs && !isNewJob && !isBoard ? active : inactive
                }`}
            >
              Állások
            </a>

            <a
              href="/jobs/new"
              className={`${base} ${isNewJob ? active : inactive
                }`}
            >
              Új állás
            </a>

            <a
              href="/jobs/board"
              className={`${base} ${isBoard && !isNewJob ? active : inactive
                }`}>Board</a>

            <a href="/settings"
              className={`${base} ${isSettings ? active : inactive}`}
            >Settings</a>

            <LogoutButton/>

          </nav>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
          App
        </div>

      </div>
    </header>
  );
}