import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-spread-point/30 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  return <button className={cn(styles, variantClass(variant), className)} {...props} />;
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
}) {
  return (
    <Link href={href} className={cn(styles, variantClass(variant), className)} {...props}>
      {children}
    </Link>
  );
}

function variantClass(variant: "primary" | "ghost" | "outline") {
  if (variant === "primary") return "bg-spread-point text-white hover:bg-spread-point/90";
  if (variant === "outline") return "border border-spread-ink/15 bg-transparent text-spread-ink hover:border-spread-point";
  return "bg-transparent text-spread-ink hover:bg-spread-ink/5";
}
