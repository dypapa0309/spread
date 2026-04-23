import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-spread border border-spread-ink/10 bg-spread-bg p-5 shadow-soft", className)}
      {...props}
    />
  );
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("mx-auto w-full max-w-6xl px-4 py-5 sm:px-6", className)} {...props} />;
}
