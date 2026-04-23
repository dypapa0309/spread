import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint ? <span className="text-xs text-spread-ink/60">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 rounded-2xl border border-spread-ink/15 bg-transparent px-4 text-sm outline-none focus:border-spread-point",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 rounded-2xl border border-spread-ink/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-spread-point",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-12 rounded-2xl border border-spread-ink/15 bg-transparent px-4 text-sm outline-none focus:border-spread-point",
        className
      )}
      {...props}
    />
  );
}
