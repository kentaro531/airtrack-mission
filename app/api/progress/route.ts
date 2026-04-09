import { NextRequest, NextResponse } from "next/server";
import { getAllTimeStats, getStreak, getMonthLogs } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");

  if (type === "stats") {
    const [stats, streak] = await Promise.all([getAllTimeStats(), getStreak()]);
    return NextResponse.json({ stats, streak });
  }

  if (type === "month") {
    const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
    if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });
    const logs = await getMonthLogs(month);
    return NextResponse.json(logs);
  }

  return NextResponse.json({ error: "type required (stats|month)" }, { status: 400 });
}
