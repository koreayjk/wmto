import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 내 데이터 내려받기: 로그인한 본인의 정보만 DB 함수가 돌려줍니다.
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("export_my_data");
  if (error || !data) return NextResponse.json({ error: "unavailable" }, { status: 404 });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "content-disposition": 'attachment; filename="my-data.json"', "cache-control": "no-store" },
  });
}
