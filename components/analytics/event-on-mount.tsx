"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/lib/analytics-client";
import type { AnalyticsEventName, ChannelType, UserRole } from "@/types/spread";

export function EventOnMount({
  eventName,
  path,
  campaignId,
  channelType,
  userRole,
  metadata
}: {
  eventName: AnalyticsEventName;
  path?: string;
  campaignId?: string;
  channelType?: ChannelType;
  userRole?: UserRole;
  metadata?: Record<string, unknown>;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    trackClientEvent({
      eventName,
      path,
      campaignId,
      channelType,
      userRole,
      metadata
    });
  }, [campaignId, channelType, eventName, metadata, path, userRole]);

  return null;
}

