"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./logout-button";
import ThemeToggle from "./theme-toggle";
import ThemeProvider from "./theme-provider";

export default function DashboardNavbar() {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isJobs =
    pathname === "/jobs" || pathname.startsWith("/jobs/");
  const isNewJob = pathname === "/jobs/new";
  const isEvents = pathname === "/events";

  const base =
    "rounded-xl px-3 py-2 text-sm transition";

  const isBoard = pathname === "/jobs/board"

  const isSettings = pathname === "/settings"

  const active =
    "bg-surface-3 text-foreground";

  const inactive =
    "text-muted hover:bg-surface-2 hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            JobFlow
          </Link>

          <nav className="hidden items-center gap-2 md:flex">

            <Link
              href="/dashboard"
              className={`${base} ${isDashboard ? active : inactive
                }`}
            >
              Dashboard
            </Link>

            <Link
              href="/jobs"
              className={`${base} ${isJobs && !isNewJob && !isBoard ? active : inactive
                }`}
            >
              Jobs
            </Link>

            <Link
              href="/jobs/new"
              className={`${base} ${isNewJob ? active : inactive
                }`}
            >
              New job
            </Link>

            <Link
              href="/jobs/board"
              className={`${base} ${isBoard && !isNewJob ? active : inactive
                }`}>Board</Link>

            <Link
              href="/events"
              className={`${base} ${isEvents ? active : inactive}`}
            >
              Events
            </Link>

            <Link href="/settings"
              className={`${base} ${isSettings ? active : inactive}`}
            >Settings</Link>

            <LogoutButton />

          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeProvider>
            <div className="hidden md:inline-flex">
              <ThemeToggle />
            </div>
          </ThemeProvider>
        </div>
      </div>
    </header>
  );
}