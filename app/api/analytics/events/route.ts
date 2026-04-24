import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/services/analytics-service";
import type { AnalyticsEventPayload } from "@/types/spread";

export const dynamic = "force-dynamic";

type AnalyticsBatchPayload = {
  events?: AnalyticsEventPayload[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyticsBatchPayload;
    const events = payload.events ?? [];

    if (!events.length) {
      return NextResponse.json({ ok: false, message: "저장할 이벤트가 없습니다." }, { status: 400 });
    }

    await Promise.all(
      events.map(async (event) => {
        if (!event.eventName || !event.visitorId || !event.sessionId || !event.path) {
          return;
        }
        await trackAnalyticsEvent(event);
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "이벤트 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
