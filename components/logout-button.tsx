"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:bg-surface-2"
    >
      Kijelentkezés
    </button>
  );
}