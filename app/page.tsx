"use client";

import { useState, useEffect, useCallback } from "react";
import { PHASES, WEEK_PLAN, getDayIndex, formatDateKey } from "@/lib/plan";
import type { DayPlan, MenuItem } from "@/lib/plan";

// ============================================================
// STYLES
// ============================================================
const font = {
  display: "'Outfit', sans-serif",
  mono: "'DM Mono', monospace",
};

const colors = {
  bg: "#0A0A0A",
  surface: "#111113",
  surfaceHover: "#19191D",
  border: "#222228",
  borderLight: "#333",
  text: "#E5E5E5",
  textMuted: "#888",
  textDim: "#555",
  accent: "#F97316",
  accentGlow: "#F9731630",
  green: "#22C55E",
  greenDim: "#0D1F0D",
  greenBorder: "#22543D",
};

// ============================================================
// TYPES
// ============================================================
interface DailyLog {
  checked: Record<string, boolean>;
  flareCount?: number;
  note?: string;
}

interface Stats {
  totalDays: number;
  totalMinutes: number;
  startDate: string;
  bestFlareCount: number;
}

interface Streak {
  current: number;
  best: number;
}

type Tab = "today" | "week" | "progress";

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AirtrackMission() {
  const [tab, setTab] = useState<Tab>("today");
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [log, setLog] = useState<DailyLog>({ checked: {} });
  const [flareInput, setFlareInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState<Streak>({ current: 0, best: 0 });
  const [weekLogs, setWeekLogs] = useState<Record<string, DailyLog>>({});
  const [monthLogs, setMonthLogs] = useState<Record<string, DailyLog>>({});
  const [saving, setSaving] = useState(false);
  const [activePhase] = useState(0);

  const dateKey = formatDateKey(selectedDate);
  const dayIndex = getDayIndex(selectedDate);
  const dayPlan = WEEK_PLAN[dayIndex];

  // ---- Fetch daily log ----
  const fetchLog = useCallback(async (dk: string) => {
    try {
      const res = await fetch(`/api/logs?date=${dk}`);
      const data = await res.json();
      setLog(data || { checked: {} });
      setFlareInput(data?.flareCount?.toString() || "");
      setNoteInput(data?.note || "");
    } catch {
      setLog({ checked: {} });
    }
  }, []);

  // ---- Fetch stats ----
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/progress?type=stats");
      const data = await res.json();
      setStats(data.stats);
      setStreak(data.streak);
    } catch {}
  }, []);

  // ---- Fetch week logs ----
  const fetchWeekLogs = useCallback(async () => {
    const monday = new Date(selectedDate);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    const logs: Record<string, DailyLog> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dk = formatDateKey(d);
      try {
        const res = await fetch(`/api/logs?date=${dk}`);
        const data = await res.json();
        if (data && Object.keys(data.checked || {}).length > 0) {
          logs[dk] = data;
        }
      } catch {}
    }
    setWeekLogs(logs);
  }, [selectedDate]);

  // ---- Fetch month logs ----
  const fetchMonthLogs = useCallback(async () => {
    const month = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/progress?type=month&month=${month}`);
      const data = await res.json();
      setMonthLogs(data || {});
    } catch {}
  }, [selectedDate]);

  useEffect(() => {
    fetchLog(dateKey);
    fetchStats();
  }, [dateKey, fetchLog, fetchStats]);

  useEffect(() => {
    if (tab === "week") fetchWeekLogs();
    if (tab === "progress") {
      fetchMonthLogs();
      fetchStats();
    }
  }, [tab, fetchWeekLogs, fetchMonthLogs, fetchStats]);

  // ---- Save ----
  const save = useCallback(
    async (newLog: DailyLog) => {
      setSaving(true);
      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateKey,
            checked: newLog.checked,
            flareCount: newLog.flareCount,
            note: newLog.note,
          }),
        });
      } catch {}
      setSaving(false);
    },
    [dateKey]
  );

  const toggleCheck = (menuIdx: number) => {
    const key = String(menuIdx);
    const newChecked = { ...log.checked, [key]: !log.checked[key] };
    const newLog = { ...log, checked: newChecked };
    setLog(newLog);
    save(newLog);
  };

  const saveFlareCount = () => {
    const count = parseInt(flareInput) || undefined;
    const newLog = { ...log, flareCount: count };
    setLog(newLog);
    save(newLog);
  };

  const saveNote = () => {
    const newLog = { ...log, note: noteInput || undefined };
    setLog(newLog);
    save(newLog);
  };

  // ---- Computed ----
  const completedCount = Object.values(log.checked).filter(Boolean).length;
  const totalItems = dayPlan.menu.length;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const daysSinceStart = stats
    ? Math.max(1, Math.floor((Date.now() - new Date(stats.startDate).getTime()) / 86400000))
    : 1;

  // ---- Week dates ----
  const getWeekDates = () => {
    const monday = new Date(selectedDate);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  // ---- Month calendar ----
  const getMonthDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: font.display,
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
        paddingBottom: 80,
      }}
    >
      {/* ---- HEADER ---- */}
      <header
        style={{
          background: `linear-gradient(180deg, #12121A 0%, ${colors.bg} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          padding: "20px 20px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.accent}, #EC4899)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 900,
              color: "#fff",
              fontFamily: font.mono,
            }}
          >
            K
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 4,
                color: colors.accent,
                fontWeight: 700,
                fontFamily: font.mono,
              }}
            >
              AIRTRACK MISSION
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
              Day {daysSinceStart}
              <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 400, marginLeft: 8 }}>
                {streak.current > 0 && `🔥 ${streak.current}日連続`}
              </span>
            </div>
          </div>
          {saving && (
            <div
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: colors.accent,
                fontFamily: font.mono,
                opacity: 0.7,
              }}
            >
              保存中...
            </div>
          )}
        </div>

        {/* Phase indicator */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 6,
          }}
        >
          {PHASES.map((phase, i) => (
            <div
              key={phase.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= activePhase ? phase.color : colors.border,
                opacity: i <= activePhase ? 1 : 0.3,
              }}
            />
          ))}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: colors.textMuted,
            fontFamily: font.mono,
          }}
        >
          Phase {activePhase + 1}: {PHASES[activePhase].title} — {PHASES[activePhase].goal}
        </div>
      </header>

      {/* ---- TAB BAR ---- */}
      <nav
        style={{
          display: "flex",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        {(
          [
            { key: "today", label: "TODAY" },
            { key: "week", label: "WEEK" },
            { key: "progress", label: "PROGRESS" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              borderBottom: tab === key ? `2px solid ${colors.accent}` : "2px solid transparent",
              background: "none",
              color: tab === key ? colors.accent : colors.textDim,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              fontFamily: font.mono,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ============================================================ */}
      {/* TODAY TAB */}
      {/* ============================================================ */}
      {tab === "today" && (
        <div style={{ padding: "0 16px" }}>
          {/* Date display */}
          <div
            style={{
              padding: "16px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d);
              }}
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                borderRadius: 8,
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ←
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: font.mono }}>
                {selectedDate.getMonth() + 1}/{selectedDate.getDate()}
                <span style={{ fontSize: 13, fontWeight: 400, color: colors.textMuted, marginLeft: 6 }}>
                  ({dayPlan.day})
                </span>
              </div>
              <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>{dateKey}</div>
            </div>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d);
              }}
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                borderRadius: 8,
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              →
            </button>
          </div>

          {/* Day header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: `${dayPlan.tagColor}20`,
                  color: dayPlan.tagColor,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 2,
                  fontFamily: font.mono,
                }}
              >
                {dayPlan.tag}
              </span>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                {dayPlan.type}
              </div>
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: dayPlan.tagColor,
                fontFamily: font.mono,
              }}
            >
              {dayPlan.duration}
            </div>
          </div>

          {/* Progress bar */}
          {dayPlan.tag !== "REST" && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: colors.textDim,
                  marginBottom: 4,
                  fontFamily: font.mono,
                }}
              >
                <span>
                  {completedCount}/{totalItems} 完了
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div
                style={{
                  height: 6,
                  background: colors.border,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${dayPlan.tagColor}, ${dayPlan.tagColor}BB)`,
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Menu items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dayPlan.menu.map((item: MenuItem, i: number) => {
              const isChecked = log.checked[String(i)];
              const isRest = dayPlan.tag === "REST";
              return (
                <div
                  key={i}
                  onClick={() => !isRest && toggleCheck(i)}
                  style={{
                    background: isChecked ? colors.greenDim : colors.surface,
                    border: `1px solid ${isChecked ? colors.greenBorder : colors.border}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: isRest ? "default" : "pointer",
                    transition: "all 0.2s",
                    opacity: isChecked ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
                      {!isRest && (
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: `2px solid ${isChecked ? colors.green : "#444"}`,
                            background: isChecked ? colors.green : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 1,
                            transition: "all 0.2s",
                          }}
                        >
                          {isChecked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: isChecked ? colors.green : "#fff",
                            textDecoration: isChecked ? "line-through" : "none",
                            marginBottom: 3,
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>{item.detail}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: dayPlan.tagColor,
                        background: `${dayPlan.tagColor}15`,
                        padding: "3px 8px",
                        borderRadius: 6,
                        flexShrink: 0,
                        marginLeft: 8,
                        fontFamily: font.mono,
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flare count + Note (only on power/session days) */}
          {(dayPlan.tag === "POWER" || dayPlan.tag === "SESSION") && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: colors.accent, letterSpacing: 2, fontFamily: font.mono, marginBottom: 12 }}>
                TODAY&apos;S RECORD
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: colors.textMuted, whiteSpace: "nowrap" }}>フレア最大周回:</label>
                <input
                  type="number"
                  value={flareInput}
                  onChange={(e) => setFlareInput(e.target.value)}
                  onBlur={saveFlareCount}
                  placeholder="0"
                  style={{
                    flex: 1,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: font.mono,
                    textAlign: "center",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: 13, color: colors.textMuted }}>周</span>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onBlur={saveNote}
                placeholder="メモ（調子、気づき、痛みなど）"
                rows={2}
                style={{
                  width: "100%",
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: colors.text,
                  fontSize: 13,
                  fontFamily: font.display,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* 40歳ルール */}
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: colors.surface,
              border: `1px solid ${colors.accentGlow}`,
              borderRadius: 12,
              borderLeft: `3px solid ${colors.accent}`,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: colors.accent, letterSpacing: 2, fontFamily: font.mono, marginBottom: 4 }}>
              40歳のルール
            </div>
            <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7 }}>
              痛みが出たら即中止。「あと1回」が怪我に繋がる。プロセスを楽しめないトレーニングは長続きしない — 音楽をかけて、サイファーの感覚で。
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* WEEK TAB */}
      {/* ============================================================ */}
      {tab === "week" && (
        <div style={{ padding: "16px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            週間サマリー
          </div>

          {/* Week grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {getWeekDates().map((date, i) => {
              const dk = formatDateKey(date);
              const wLog = weekLogs[dk];
              const plan = WEEK_PLAN[i];
              const checked = wLog ? Object.values(wLog.checked).filter(Boolean).length : 0;
              const total = plan.menu.length;
              const pct = total > 0 ? (checked / total) * 100 : 0;
              const isToday = dk === formatDateKey(today);
              const isRest = plan.tag === "REST";

              return (
                <div
                  key={dk}
                  onClick={() => {
                    setSelectedDate(date);
                    setTab("today");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: isToday ? colors.surfaceHover : colors.surface,
                    border: `1px solid ${isToday ? colors.accent + "40" : colors.border}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Day label */}
                  <div style={{ width: 38, textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: plan.tagColor,
                        fontFamily: font.mono,
                        letterSpacing: 1,
                      }}
                    >
                      {plan.dayEn}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? "#fff" : colors.textMuted }}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                      {plan.type}
                    </div>
                    {!isRest ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: colors.border,
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: plan.tagColor,
                              borderRadius: 2,
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: pct === 100 ? colors.green : colors.textDim,
                            fontFamily: font.mono,
                            fontWeight: 700,
                            minWidth: 30,
                            textAlign: "right",
                          }}
                        >
                          {pct === 100 ? "✓" : `${Math.round(pct)}%`}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: colors.textDim }}>休息日</div>
                    )}
                  </div>

                  {/* Flare count badge */}
                  {wLog?.flareCount && (
                    <div
                      style={{
                        background: `${colors.accent}20`,
                        color: colors.accent,
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: font.mono,
                      }}
                    >
                      {wLog.flareCount}周
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly totals */}
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {[
              {
                label: "練習日数",
                value: `${Object.keys(weekLogs).length}/6`,
                color: colors.accent,
              },
              {
                label: "最大フレア",
                value: `${Math.max(0, ...Object.values(weekLogs).map((l) => l.flareCount || 0))}周`,
                color: "#8B5CF6",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: 16,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: colors.textDim, fontFamily: font.mono, letterSpacing: 1, marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, fontFamily: font.mono }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PROGRESS TAB */}
      {/* ============================================================ */}
      {tab === "progress" && (
        <div style={{ padding: "16px" }}>
          {/* All-time stats */}
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            累計スタッツ
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {[
              { label: "練習日数", value: stats?.totalDays || Object.keys(monthLogs).length, unit: "日" },
              { label: "総練習時間", value: Math.round((stats?.totalMinutes || 0) / 60), unit: "h" },
              { label: "ベストフレア", value: stats?.bestFlareCount || 0, unit: "周" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: 14,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 9, color: colors.textDim, fontFamily: font.mono, letterSpacing: 1, marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: colors.accent, fontFamily: font.mono }}>
                  {s.value}
                  <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 400 }}>{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Streak */}
          <div
            style={{
              padding: 16,
              background: `linear-gradient(135deg, #1A0A00 0%, ${colors.surface} 100%)`,
              border: `1px solid ${colors.accent}30`,
              borderRadius: 12,
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: colors.textDim, fontFamily: font.mono, letterSpacing: 1 }}>CURRENT STREAK</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: colors.accent, fontFamily: font.mono }}>
                🔥 {streak.current}
                <span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 400 }}>日</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: colors.textDim, fontFamily: font.mono, letterSpacing: 1 }}>BEST</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#EC4899", fontFamily: font.mono }}>
                {streak.best}
                <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 400 }}>日</span>
              </div>
            </div>
          </div>

          {/* Monthly heatmap */}
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            月間カレンダー
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setMonth(d.getMonth() - 1);
                setSelectedDate(d);
              }}
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              ←
            </button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: font.mono }}>
              {selectedDate.getFullYear()}/{String(selectedDate.getMonth() + 1).padStart(2, "0")}
            </span>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setMonth(d.getMonth() + 1);
                setSelectedDate(d);
              }}
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                color: colors.textMuted,
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              →
            </button>
          </div>

          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            {["月", "火", "水", "木", "金", "土", "日"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: colors.textDim,
                  fontFamily: font.mono,
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {getMonthDays().map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const dk = formatDateKey(date);
              const mLog = monthLogs[dk];
              const dayIdx = getDayIndex(date);
              const plan = WEEK_PLAN[dayIdx];
              const isRest = plan.tag === "REST";
              const checked = mLog ? Object.values(mLog.checked).filter(Boolean).length : 0;
              const total = plan.menu.length;
              const pct = total > 0 ? checked / total : 0;
              const isToday = dk === formatDateKey(today);

              let bg = colors.surface;
              if (isRest && mLog) bg = "#1a1a1a";
              else if (pct === 1) bg = "#0A2A0A";
              else if (pct > 0.5) bg = "#1A1500";
              else if (pct > 0) bg = "#1A1000";

              return (
                <div
                  key={dk}
                  onClick={() => {
                    setSelectedDate(date);
                    setTab("today");
                  }}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 8,
                    background: bg,
                    border: `1px solid ${isToday ? colors.accent : pct === 1 ? colors.greenBorder : colors.border}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 800 : 500,
                      color: isToday ? colors.accent : pct > 0 ? "#fff" : colors.textDim,
                      fontFamily: font.mono,
                    }}
                  >
                    {date.getDate()}
                  </div>
                  {pct === 1 && (
                    <div style={{ fontSize: 8, color: colors.green, marginTop: 1 }}>✓</div>
                  )}
                  {mLog?.flareCount && mLog.flareCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 3,
                        fontSize: 7,
                        color: colors.accent,
                        fontFamily: font.mono,
                        fontWeight: 700,
                      }}
                    >
                      {mLog.flareCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Flare progression chart (simple bar) */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              フレア周回数の推移
            </div>
            {(() => {
              const entries = Object.entries(monthLogs)
                .filter(([, l]) => l.flareCount && l.flareCount > 0)
                .sort(([a], [b]) => a.localeCompare(b));

              if (entries.length === 0) {
                return (
                  <div
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: colors.textDim,
                      fontSize: 13,
                      background: colors.surface,
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    まだ記録がありません。
                    <br />
                    POWERまたはSESSION日にフレア周回数を入力しよう。
                  </div>
                );
              }

              const maxFlare = Math.max(...entries.map(([, l]) => l.flareCount || 0));

              return (
                <div
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {entries.map(([dk, l]) => {
                      const count = l.flareCount || 0;
                      const pct = maxFlare > 0 ? (count / maxFlare) * 100 : 0;
                      const dateLabel = dk.slice(5); // MM-DD
                      return (
                        <div key={dk} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontSize: 10,
                              color: colors.textDim,
                              fontFamily: font.mono,
                              width: 45,
                              flexShrink: 0,
                            }}
                          >
                            {dateLabel}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 16,
                              background: colors.bg,
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: `linear-gradient(90deg, ${colors.accent}, #EC4899)`,
                                borderRadius: 4,
                                minWidth: 2,
                                transition: "width 0.4s",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: colors.accent,
                              fontFamily: font.mono,
                              width: 30,
                              textAlign: "right",
                            }}
                          >
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Target line */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      background: `${colors.accent}10`,
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, color: colors.textMuted }}>Phase 1 目標</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: colors.accent, fontFamily: font.mono }}>
                      10周
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
