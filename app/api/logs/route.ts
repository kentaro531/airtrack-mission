import { NextRequest, NextResponse } from "next/server";
import { getDailyLog, saveDailyLog, getStreak, saveStreak, getAllTimeStats, saveAllTimeStats } from "@/lib/kv";
import { WEEK_PLAN, getDayIndex } from "@/lib/plan";

export async function GET(req: NextRequest) {
  const dateKey = req.nextUrl.searchParams.get("date");
  if (!dateKey) return NextResponse.json({ error: "date required" }, { status: 400 });

  const log = await getDailyLog(dateKey);
  return NextResponse.json(log || { checked: {} });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, checked, flareCount, note, videoUrl } = body;

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  // Save daily log
  await saveDailyLog(date, { checked: checked || {}, flareCount, note, videoUrl });

  // Update streak
  const streak = await getStreak();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (date === today || date === yesterday) {
    const checkedCount = Object.values(checked || {}).filter(Boolean).length;
    if (checkedCount > 0) {
      if (date === today) {
        streak.current += 1;
      }
      if (streak.current > streak.best) {
        streak.best = streak.current;
      }
    }
    await saveStreak(streak);
  }

  // Update all-time stats
  const stats = await getAllTimeStats();
  const dayOfWeek = getDayIndex(new Date(date));
  const dayPlan = WEEK_PLAN[dayOfWeek];
  const checkedCount = Object.values(checked || {}).filter(Boolean).length;

  if (checkedCount > 0) {
    // Parse duration string to minutes
    const durationStr = dayPlan?.duration || "0h";
    const hours = parseFloat(durationStr.replace("h", "")) || 0;
    const completedRatio = dayPlan ? checkedCount / dayPlan.menu.length : 0;
    const minutes = Math.round(hours * 60 * completedRatio);

    stats.totalMinutes += minutes;
    if (flareCount && flareCount > stats.bestFlareCount) {
      stats.bestFlareCount = flareCount;
    }
  }
  await saveAllTimeStats(stats);

  return NextResponse.json({ ok: true });
}
