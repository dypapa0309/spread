import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import type { ApplicationStatus, BrandPlan } from "@/types/spread";

export const dynamic = "force-dynamic";

const PLAN_LIMITS: Record<BrandPlan, { monthlySelectedLimit: number; label: string }> = {
  basic: { monthlySelectedLimit: 20, label: "Basic" },
  standard: { monthlySelectedLimit: 80, label: "Standard" },
  pro: { monthlySelectedLimit: 250, label: "Pro" }
};

type StatusPayload = {
  applicationIds?: string[];
  status?: ApplicationStatus;
};

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as StatusPayload;
    const applicationIds = [...new Set(payload.applicationIds ?? [])];
    const status = payload.status;

    if (!applicationIds.length) return NextResponse.json({ ok: false, message: "선택된 신청자가 없습니다." }, { status: 400 });
    if (!status || !["applied", "selected", "rejected", "cancelled"].includes(status)) {
      return NextResponse.json({ ok: false, message: "변경할 상태가 올바르지 않습니다." }, { status: 400 });
    }

    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("users")
      .select("id, role, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !["admin", "brand"].includes(profile.role)) {
      return NextResponse.json({ ok: false, message: "신청자 상태를 변경할 권한이 없습니다." }, { status: 403 });
    }

    const { data: applications } = await adminSupabase
      .from("campaign_applications")
      .select("id, campaign_id, user_id, status, campaign:campaigns!campaign_id(brand_id, brand:brands!brand_id(*))")
      .in("id", applicationIds);

    if (!applications?.length) {
      return NextResponse.json({ ok: false, message: "신청자를 찾을 수 없습니다." }, { status: 404 });
    }

    const campaignBrandIds = new Set(
      applications.map((row: Record<string, unknown>) => {
        const campaign = row.campaign as { brand_id?: string } | null;
        return campaign?.brand_id ?? "";
      })
    );
    campaignBrandIds.delete("");
    if (campaignBrandIds.size !== 1) {
      return NextResponse.json({ ok: false, message: "같은 브랜드의 신청자만 한 번에 처리할 수 있습니다." }, { status: 400 });
    }

    const brandId = [...campaignBrandIds][0];
    const firstCampaign = applications[0].campaign as { brand?: { contact_email?: string; plan?: BrandPlan } } | null;
    if (profile.role === "brand" && firstCampaign?.brand?.contact_email !== profile.email) {
      return NextResponse.json({ ok: false, message: "내 브랜드 신청자만 처리할 수 있습니다." }, { status: 403 });
    }

    if (status === "selected") {
      const brandPlan = firstCampaign?.brand?.plan ?? "basic";
      const limit = PLAN_LIMITS[brandPlan]?.monthlySelectedLimit ?? PLAN_LIMITS.basic.monthlySelectedLimit;
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: selectedRows } = await adminSupabase
        .from("campaign_applications")
        .select("campaign_id, user_id, campaign:campaigns!campaign_id(brand_id)")
        .eq("status", "selected")
        .gte("decided_at", monthStart.toISOString());

      const selectedSet = new Set(
        (selectedRows ?? [])
          .filter((row: Record<string, unknown>) => {
            const campaign = row.campaign as { brand_id?: string } | null;
            return campaign?.brand_id === brandId;
          })
          .map((row: Record<string, unknown>) => `${row.campaign_id}:${row.user_id}`)
      );
      const newSelections = new Set(
        applications
          .filter((row: Record<string, unknown>) => row.status !== "selected")
          .map((row: Record<string, unknown>) => `${row.campaign_id}:${row.user_id}`)
      );
      let additions = 0;
      newSelections.forEach((key) => {
        if (!selectedSet.has(key)) additions += 1;
      });

      if (selectedSet.size + additions > limit) {
        return NextResponse.json(
          { ok: false, message: `${PLAN_LIMITS[brandPlan]?.label ?? "Basic"} 플랜의 월 선정 한도 ${limit}명을 초과합니다.` },
          { status: 400 }
        );
      }
    }

    const { error } = await adminSupabase
      .from("campaign_applications")
      .update({
        status,
        decided_at: status === "applied" ? null : new Date().toISOString(),
        decided_by: status === "applied" ? null : user.id
      })
      .in("id", applicationIds);

    if (error) return NextResponse.json({ ok: false, message: `상태 변경 실패: ${error.message}` }, { status: 400 });

    return NextResponse.json({ ok: true, message: "상태가 변경되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "상태 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
