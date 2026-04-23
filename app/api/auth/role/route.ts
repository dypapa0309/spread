import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }

    const metadataRole = user.user_metadata?.role;
    const role = data?.role ?? (metadataRole === "admin" || metadataRole === "brand" ? metadataRole : "member");

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "역할 확인 중 오류가 발생했습니다."
      },
      { status: 500 }
    );
  }
}
