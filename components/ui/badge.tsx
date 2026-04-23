import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, active = false, className }: { children: ReactNode; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        active
          ? "border-spread-point bg-spread-point/10 text-spread-point"
          : "border-spread-ink/15 bg-spread-ink/[0.03] text-spread-ink",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ children }: { children: ReactNode }) {
  return <Badge active>{children}</Badge>;
}
