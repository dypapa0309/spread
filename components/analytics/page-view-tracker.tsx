"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackClientEvent } from "@/lib/analytics-client";

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (!path || lastTrackedRef.current === path) return;

    lastTrackedRef.current = path;
    trackClientEvent({
      eventName: "page_view",
      path
    });
  }, [pathname, searchParams]);

  return null;
}

