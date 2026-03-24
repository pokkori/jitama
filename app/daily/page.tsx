"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KANJI_LEVELS } from "@/lib/kanji-data";

// 今日の日付seed（全ユーザー共通）
function getTodaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// デイリーチャレンジの目標漢字レベルを決定（seed依存）
function getDailyTargetLevel(): number {
  const seed = getTodaySeed();
  // Lv5〜Lv9の間（林〜晶）
  return 5 + (seed % 5);
}

function getDailyTargetScore(): number {
  const seed = getTodaySeed();
  return 800 + (seed % 7) * 200; // 800〜2000
}

function getDailyChallengeStorage() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem("jitama_daily_challenge_v2");
    if (!raw) return { date: "", best: 0, highestLevel: 0, completed: false };
    const data = JSON.parse(raw);
    if (data.date !== today) return { date: today, best: 0, highestLevel: 0, completed: false };
    return data;
  } catch {
    return { date: today, best: 0, highestLevel: 0, completed: false };
  }
}

// 絵文字グリッド生成（Wordle風）
const KANJI_EMOJIS = ["", "", "", "", "", "", "", "", "", "", "", ""];

function generateDailyShareText(highestLevel: number, score: number, targetLevel: number, targetScore: number): string {
  const cleared = highestLevel >= targetLevel && score >= targetScore;
  const levelEmojis = KANJI_LEVELS.slice(0, highestLevel + 1).map((_, i) => {
    if (i < highestLevel) return "";
    return "";
  });
  const emptySlots = Array(Math.max(0, 11 - highestLevel)).fill("⬛");
  const grid = [...levelEmojis, ...emptySlots];
  const rows = [];
  for (let i = 0; i < 4; i++) {
    rows.push(grid.slice(i * 3, i * 3 + 3).join(""));
  }

  const date = new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  return `字玉JITAMA デイリーチャレンジ ${date}\n${cleared ? " クリア！" : "挑戦中"} 最高: ${KANJI_LEVELS[highestLevel]?.char ?? "—"}（${score.toLocaleString()}pt）\n${rows.join("\n")}\nhttps://jitama.vercel.app/daily #字玉JITAMA #デイリー漢字`;
}

export default function DailyPage() {
  const targetLevel = getDailyTargetLevel();
  const targetScore = getDailyTargetScore();
  const targetKanji = KANJI_LEVELS[targetLevel];

  const [storage, setStorage] = useState({ date: "", best: 0, highestLevel: 0, completed: false });
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setStorage(getDailyChallengeStorage());
    setTodayStr(new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric" }));
  }, []);

  const cleared = storage.highestLevel >= targetLevel && storage.best >= targetScore;
  const progress = Math.min(100, Math.round((storage.best / targetScore) * 100));
  const shareText = generateDailyShareText(storage.highestLevel, storage.best, targetLevel, targetScore);
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-[#1a0a2e] text-white">
      {/* ヘッダー */}
      <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-2 flex items-center gap-3">
        <Link href="/" className="text-purple-400 hover:text-purple-200 text-sm transition-colors">← トップ</Link>
        <h1 className="text-lg font-black text-yellow-300 flex-1 text-center"> デイリーチャレンジ</h1>
        <Link href="/game?mode=N5" className="text-purple-400 hover:text-purple-200 text-sm transition-colors">ゲーム →</Link>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12">
        {/* 今日の日付バッジ */}
        <div className="text-center mb-6">
          <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-4 py-1.5 rounded-full font-bold">
            ️ {todayStr}の挑戦 — 全プレイヤー共通
          </span>
        </div>

        {/* 目標 */}
        <div className="bg-gradient-to-br from-purple-900/60 to-yellow-900/30 border border-yellow-500/40 rounded-2xl p-6 mb-6 text-center">
          <p className="text-xs text-purple-400 mb-2 font-bold tracking-wider">TODAY&apos;S CHALLENGE</p>
          <div className="text-6xl font-black mb-2" style={{ color: `#${targetKanji.color.toString(16).padStart(6, "0")}` }}>
            {targetKanji.char}
          </div>
          <p className="text-sm text-yellow-300 font-bold mb-1">「{targetKanji.char}」以上 & {targetScore.toLocaleString()}pt以上を達成</p>
          <p className="text-xs text-purple-400">
            読み: {targetKanji.reading} / 意味: {targetKanji.meaning}
          </p>
        </div>

        {/* 達成状況 */}
        {storage.best > 0 && (
          <div className={`rounded-2xl p-5 mb-6 border ${cleared ? "bg-green-900/30 border-green-500/50" : "bg-purple-900/30 border-purple-700/50"}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-sm">
                {cleared ? " クリア達成！" : " チャレンジ中"}
              </h2>
              <span className="text-xs" style={{ color: "rgba(168,85,247,0.7)" }}>
                最高: {KANJI_LEVELS[Math.min(storage.highestLevel, KANJI_LEVELS.length - 1)]?.char ?? "—"}
              </span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1 text-purple-400">
                <span>スコア進捗</span>
                <span>{storage.best.toLocaleString()} / {targetScore.toLocaleString()}pt ({progress}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-purple-900/60">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: cleared ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #a855f7, #7c3aed)"
                  }}
                />
              </div>
            </div>
            {cleared && (
              <p className="text-xs text-green-400 text-center font-bold">今日のチャレンジをクリア！Xでシェアしよう</p>
            )}
          </div>
        )}

        {/* 挑戦ボタン */}
        <div className="text-center mb-6">
          <Link
            href="/game?mode=N5"
            className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-black text-lg px-12 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            {storage.best > 0 ? "もう一度挑戦する →" : "デイリーチャレンジを始める →"}
          </Link>
          <p className="text-xs text-purple-500 mt-2">N5モードで挑戦（無料）</p>
        </div>

        {/* シェアカード */}
        {storage.best > 0 && (
          <div className="bg-white/5 border border-purple-800 rounded-2xl p-5 mb-6">
            <p className="text-xs text-purple-400 font-bold mb-3 text-center"> Xシェア用テキスト</p>
            <pre className="text-xs text-purple-200 whitespace-pre-wrap font-mono leading-relaxed mb-4 bg-white/5 rounded-xl p-3">
              {shareText}
            </pre>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: "#000" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {cleared ? "クリアをXでシェア！" : "挑戦中をXでシェア"}
            </a>
          </div>
        )}

        {/* 合体チャート（今日の目標まで） */}
        <div className="bg-white/5 border border-purple-800 rounded-2xl p-5 mb-6">
          <p className="text-xs text-purple-400 font-bold mb-4 text-center">今日の目標まで — 合体ルート</p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {KANJI_LEVELS.slice(0, targetLevel + 1).map((kl, i) => (
              <div key={kl.level} className="flex items-center gap-1">
                <div className="text-center">
                  <div
                    className={`font-black text-xl px-2 py-1 rounded-lg ${i === targetLevel ? "ring-2 ring-yellow-400" : ""}`}
                    style={{ color: `#${kl.color.toString(16).padStart(6, "0")}` }}
                  >
                    {kl.char}
                  </div>
                  <div className="text-[8px] text-purple-500">{kl.jlpt}</div>
                </div>
                {i < targetLevel && <span className="text-purple-600 text-xs">→</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-yellow-400 text-center mt-3 font-bold">
            ゴール: 「{targetKanji.char}」（{targetKanji.reading}）
          </p>
        </div>

        {/* 参加者数（演出） */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-full px-5 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-300 font-bold">今日の挑戦者: {(getTodaySeed() % 2000 + 1200).toLocaleString()}人</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/game?mode=N5"
            className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-black text-base px-10 py-3 rounded-2xl hover:scale-105 transition-transform"
          >
            今すぐ挑戦する →
          </Link>
        </div>
      </div>
    </div>
  );
}
