"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  children,
  selected,
  onClick
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full border px-4 text-sm font-semibold transition",
        selected
          ? "border-spread-point bg-spread-point text-white"
          : "border-spread-ink/15 bg-transparent text-spread-ink hover:border-spread-point"
      )}
    >
      {children}
    </button>
  );
}
