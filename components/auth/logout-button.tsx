"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full px-3 py-2 text-sm font-semibold text-spread-ink/60 hover:bg-spread-ink/5 disabled:opacity-50"
    >
      {loading ? "..." : "로그아웃"}
    </button>
  );
}
