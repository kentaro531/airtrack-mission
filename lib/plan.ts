export interface MenuItem {
  name: string;
  time: string;
  detail: string;
}

export interface DayPlan {
  day: string;
  dayEn: string;
  type: string;
  tag: string;
  tagColor: string;
  duration: string;
  menu: MenuItem[];
}

export interface Phase {
  id: string;
  label: string;
  title: string;
  duration: string;
  goal: string;
  color: string;
}

export const PHASES: Phase[] = [
  {
    id: "current",
    label: "Phase 1",
    title: "フレア安定化",
    duration: "今〜6ヶ月",
    goal: "フレア10周連続 + 片手支持力UP",
    color: "#F97316",
  },
  {
    id: "intro",
    label: "Phase 2",
    title: "エアートラックス導入",
    duration: "6〜12ヶ月",
    goal: "1発キャッチ安定",
    color: "#8B5CF6",
  },
  {
    id: "connect",
    label: "Phase 3",
    title: "連続エアートラックス",
    duration: "12〜18ヶ月",
    goal: "2-3発連続",
    color: "#06B6D4",
  },
];

export const WEEK_PLAN: DayPlan[] = [
  {
    day: "月",
    dayEn: "MON",
    type: "フレア強化",
    tag: "POWER",
    tagColor: "#F97316",
    duration: "2h",
    menu: [
      { name: "ウォームアップ & ストレッチ", time: "15min", detail: "肩回し、手首ストレッチ、開脚、ブリッジ" },
      { name: "マッシュルーム練習（旋回）", time: "20min", detail: "フレアの腰高キープ感覚。なければ低い台で代用" },
      { name: "フレア練習", time: "45min", detail: "目標: 現状+1周。フォーム重視。5分回して2分休憩のインターバル" },
      { name: "フレア → ウィンドミル トランジション", time: "20min", detail: "コンボの流れを身体に覚えさせる" },
      { name: "クールダウン & ケア", time: "20min", detail: "フォームローラー、肩・手首アイシング" },
    ],
  },
  {
    day: "火",
    dayEn: "TUE",
    type: "ハンドスタンド & 肩強化",
    tag: "STRENGTH",
    tagColor: "#8B5CF6",
    duration: "1.5h",
    menu: [
      { name: "ウォームアップ", time: "10min", detail: "手首サークル、キャットカウ、ショルダーディスロケイト" },
      { name: "ハンドスタンドウォーク（円移動）", time: "20min", detail: "時計回り・反時計回り各10周 × 3セット" },
      { name: "片手タップ（倒立）", time: "15min", detail: "左右交互に手を離す。各手5秒キープ目標" },
      { name: "ハンドスタンド → ホッピング", time: "15min", detail: "両手でホップして位置を移動。エアートラックスのキャッチ感覚" },
      { name: "肩・体幹トレ", time: "20min", detail: "パイクプッシュアップ3×10、プランシェリーン3×15秒、Lシット3×20秒" },
      { name: "ストレッチ & ケア", time: "10min", detail: "肩甲骨周り重点、手首ストレッチ" },
    ],
  },
  {
    day: "水",
    dayEn: "WED",
    type: "リカバリー & モビリティ",
    tag: "RECOVERY",
    tagColor: "#10B981",
    duration: "1h",
    menu: [
      { name: "軽いジョグ or ウォーキング", time: "15min", detail: "心拍を上げすぎない。血流促進が目的" },
      { name: "全身ストレッチ", time: "20min", detail: "肩、股関節、ハムストリング、手首を重点的に" },
      { name: "フォームローラー & マッサージ", time: "15min", detail: "前腕、肩、大腿四頭筋、ふくらはぎ" },
      { name: "動画研究", time: "10min", detail: "Benny Kimoto、Kujo、Monkey Kingのエアートラックス動画を分析" },
    ],
  },
  {
    day: "木",
    dayEn: "THU",
    type: "フレア強化",
    tag: "POWER",
    tagColor: "#F97316",
    duration: "2h",
    menu: [
      { name: "ウォームアップ & ストレッチ", time: "15min", detail: "月曜と同じルーティン" },
      { name: "フレア集中練習", time: "50min", detail: "前半: フォーム矯正（鏡 or 撮影チェック）。後半: 周回数チャレンジ" },
      { name: "スワイプ練習", time: "20min", detail: "エアートラックスの投げ出し感覚に繋がる。爆発力トレーニング" },
      { name: "ウィンドミル → フレア → フリーズ", time: "15min", detail: "ラウンド構成を意識した流れ練習" },
      { name: "クールダウン & ケア", time: "20min", detail: "フォームローラー、抗炎症食（ターメリック等）摂取" },
    ],
  },
  {
    day: "金",
    dayEn: "FRI",
    type: "ハンドスタンド & 爆発力",
    tag: "STRENGTH",
    tagColor: "#8B5CF6",
    duration: "1.5h",
    menu: [
      { name: "ウォームアップ", time: "10min", detail: "動的ストレッチ中心" },
      { name: "片手ハンドスタンド練習", time: "20min", detail: "壁あり→壁なしで左右各5回チャレンジ" },
      { name: "ハンドスタンド プッシュアップ", time: "15min", detail: "壁倒立から3×5回。肩のプレス力強化" },
      { name: "プライオメトリクス", time: "15min", detail: "ジャンプスクワット、バーピー、手叩きプッシュアップ。爆発力UP" },
      { name: "体幹トレ", time: "15min", detail: "Vシット、ドラゴンフラッグ、ハンギングレッグレイズ" },
      { name: "ストレッチ & ケア", time: "15min", detail: "全身。週末の練習に備える" },
    ],
  },
  {
    day: "土",
    dayEn: "SAT",
    type: "総合実践",
    tag: "SESSION",
    tagColor: "#EC4899",
    duration: "2.5h",
    menu: [
      { name: "ウォームアップ", time: "20min", detail: "しっかり温める。土曜は一番長いセッション" },
      { name: "フレア集中", time: "40min", detail: "週の成果確認。最大周回チャレンジを撮影" },
      { name: "エアートラックス準備ドリル", time: "30min", detail: "フレアからの投げ出し練習。マット上で1発チャレンジ" },
      { name: "トップロック & フットワーク", time: "20min", detail: "パワーだけじゃなくダンサーとしての総合力を忘れない" },
      { name: "サイファー / フリースタイル", time: "20min", detail: "音楽に合わせて実戦感覚。楽しむ時間" },
      { name: "クールダウン & 振り返り", time: "20min", detail: "撮影チェック、来週の課題メモ、アイシング" },
    ],
  },
  {
    day: "日",
    dayEn: "SUN",
    type: "完全OFF",
    tag: "REST",
    tagColor: "#6B7280",
    duration: "—",
    menu: [
      { name: "完全休息", time: "終日", detail: "40歳の体には回復日が必須。ここをサボると怪我に直結する" },
      { name: "軽い散歩OK", time: "—", detail: "Starbucksまでの朝散歩くらいはOK" },
      { name: "食事・睡眠に集中", time: "—", detail: "タンパク質摂取、抗炎症食、7-8時間睡眠" },
    ],
  },
];

// Day index: 0=Mon, 1=Tue, ...6=Sun
export function getDayIndex(date: Date): number {
  const jsDay = date.getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatWeekKey(date: Date): string {
  // Get Monday of the week
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return `week:${formatDateKey(d)}`;
}

export function formatMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `month:${y}-${m}`;
}
