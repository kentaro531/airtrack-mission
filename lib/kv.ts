import { Redis } from "@upstash/redis"
const kv = Redis.fromEnv();

// ---- Daily Log ----
// Key: log:YYYY-MM-DD
// Value: { checked: { "0": true, "2": true, ... }, flareCount?: number, note?: string, videoUrl?: string }

export interface DailyLog {
  checked: Record<string, boolean>;
  flareCount?: number;
  note?: string;
  videoUrl?: string;
}

export async function getDailyLog(dateKey: string): Promise<DailyLog | null> {
  return await kv.get<DailyLog>(`log:${dateKey}`);
}

export async function saveDailyLog(dateKey: string, data: DailyLog): Promise<void> {
  await kv.set(`log:${dateKey}`, data);
  // Also update month index
  const month = dateKey.slice(0, 7); // YYYY-MM
  const monthDays = await kv.get<string[]>(`month-days:${month}`) || [];
  if (!monthDays.includes(dateKey)) {
    monthDays.push(dateKey);
    await kv.set(`month-days:${month}`, monthDays);
  }
}

// ---- Weekly Progress ----
export interface WeeklyProgress {
  flareMax: number;
  totalSessions: number;
  totalMinutes: number;
  completionRate: number;
}

export async function getWeeklyProgress(weekKey: string): Promise<WeeklyProgress | null> {
  return await kv.get<WeeklyProgress>(`progress:${weekKey}`);
}

export async function saveWeeklyProgress(weekKey: string, data: WeeklyProgress): Promise<void> {
  await kv.set(`progress:${weekKey}`, data);
}

// ---- Monthly summary for graphs ----
export async function getMonthLogs(month: string): Promise<Record<string, DailyLog>> {
  const days = await kv.get<string[]>(`month-days:${month}`) || [];
  const result: Record<string, DailyLog> = {};
  for (const day of days) {
    const log = await getDailyLog(day);
    if (log) result[day] = log;
  }
  return result;
}

// ---- Streak tracking ----
export async function getStreak(): Promise<{ current: number; best: number }> {
  return (await kv.get<{ current: number; best: number }>("streak")) || { current: 0, best: 0 };
}

export async function saveStreak(data: { current: number; best: number }): Promise<void> {
  await kv.set("streak", data);
}

// ---- All-time stats ----
export interface AllTimeStats {
  totalDays: number;
  totalMinutes: number;
  startDate: string;
  bestFlareCount: number;
}

export async function getAllTimeStats(): Promise<AllTimeStats> {
  return (
    (await kv.get<AllTimeStats>("alltime")) || {
      totalDays: 0,
      totalMinutes: 0,
      startDate: new Date().toISOString().slice(0, 10),
      bestFlareCount: 0,
    }
  );
}

export async function saveAllTimeStats(data: AllTimeStats): Promise<void> {
  await kv.set("alltime", data);
}
