import { NextResponse } from "next/server";
import { saveCampaignRecord } from "@/services/campaign-write-service";
import type { SaveCampaignInput } from "@/services/campaign-write-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as SaveCampaignInput;
    const result = await saveCampaignRecord(input);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "캠페인 저장 중 오류가 발생했습니다."
      },
      { status: 500 }
    );
  }
}
