"use client";

import type { AnalyticsEventName, AnalyticsEventPayload, ChannelType, UserRole } from "@/types/spread";

const VISITOR_KEY = "spread_visitor_id";
const SESSION_KEY = "spread_session_id";
const SESSION_TOUCH_KEY = "spread_session_touched_at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function normalizeRoutePattern(path: string) {
  const cleaned = path.split("?")[0] || "/";
  return cleaned
    .split("/")
    .map((segment) => {
      if (!segment) return "";
      if (/^[0-9]+$/.test(segment)) return "[id]";
      if (/^[0-9a-f]{8,}$/i.test(segment.replace(/-/g, ""))) return "[id]";
      return segment;
    })
    .join("/") || "/";
}

export function resolveVisitorContext() {
  let visitorId = readStorage(VISITOR_KEY);
  if (!visitorId) {
    visitorId = `visitor-${crypto.randomUUID()}`;
    writeStorage(VISITOR_KEY, visitorId);
    setCookie("spread_visitor_id", visitorId);
  }

  const now = Date.now();
  const lastTouched = Number(readStorage(SESSION_TOUCH_KEY) ?? "0");
  let sessionId = readStorage(SESSION_KEY);
  if (!sessionId || now - lastTouched > SESSION_TIMEOUT_MS) {
    sessionId = `session-${crypto.randomUUID()}`;
    writeStorage(SESSION_KEY, sessionId);
    setCookie("spread_session_id", sessionId, 60 * 60 * 24 * 7);
  }

  writeStorage(SESSION_TOUCH_KEY, String(now));
  return { visitorId, sessionId };
}

export async function trackClientEvent(input: {
  eventName: AnalyticsEventName;
  path?: string;
  routePattern?: string;
  referrer?: string;
  campaignId?: string;
  channelType?: ChannelType;
  userRole?: UserRole;
  metadata?: Record<string, unknown>;
}) {
  if (typeof window === "undefined") return;

  const { visitorId, sessionId } = resolveVisitorContext();
  const path = input.path ?? `${window.location.pathname}${window.location.search}`;
  const payload: AnalyticsEventPayload = {
    eventName: input.eventName,
    visitorId,
    sessionId,
    path,
    routePattern: input.routePattern ?? normalizeRoutePattern(path),
    referrer: input.referrer ?? (document.referrer || undefined),
    campaignId: input.campaignId,
    channelType: input.channelType,
    userRole: input.userRole,
    metadata: input.metadata
  };

  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [payload] }),
      keepalive: true
    });
  } catch {
    // ignore tracking failures
  }
}
