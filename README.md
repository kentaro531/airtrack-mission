# AIRTRACK MISSION 🌀

40歳でエアートラックスを掴むための練習トラッキングアプリ。

## Features
- 📋 **日々のチェックリスト** — 曜日ごとのトレーニングメニューをタップで完了
- 📊 **フレア周回数の記録** — POWER/SESSION日にフレアの最大周回数を記録
- 📅 **週間サマリー** — 1週間の練習進捗を一覧表示
- 🔥 **ストリーク** — 連続練習日数を追跡
- 🗓️ **月間ヒートマップ** — カレンダーで練習密度を可視化
- 📈 **フレア推移グラフ** — 月ごとの成長を確認

## Tech Stack
- Next.js 14 (App Router)
- Vercel KV (Redis)
- TypeScript
- Vercel Deployment

## Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd airtrack-mission
npm install
```

### 2. Vercel KV Setup
1. Vercel Dashboard → Storage → Create KV Database
2. `.env.local` に KV credentials をコピー（`.env.example` 参照）

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy
```bash
vercel --prod
```

## デプロイ手順（前にドリンクチケットアプリでやったのと同じ流れ）

1. GitHub にリポジトリを作成して push
2. Vercel で import → KV を connect
3. 自動デプロイ完了

## PWA対応
ホーム画面に追加すればネイティブアプリのように使える。
`/public/icon-192.png` と `/public/icon-512.png` を追加してください。

---

*Don't major in the minors. エアートラックスに直結する練習に集中。*
