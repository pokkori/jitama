"use client";

import { useState, useEffect, useCallback } from "react";
import { getQuizQuestions, type QuizQuestion } from "@/lib/quiz-data";

type QuizLevel = "N5" | "N4" | "N3" | "N2N1";

interface KanjiQuizProps {
  isPremium: boolean;
  onOpenPayjp: () => void;
}

const QUIZ_LEVELS: { key: QuizLevel; label: string; free: boolean; color: string }[] = [
  { key: "N5", label: "JLPT N5", free: true, color: "bg-green-600" },
  { key: "N4", label: "JLPT N4", free: false, color: "bg-blue-600" },
  { key: "N3", label: "JLPT N3", free: false, color: "bg-purple-600" },
  { key: "N2N1", label: "N2 / N1", free: false, color: "bg-red-600" },
];

const TIME_PER_QUESTION = 10; // seconds
const QUESTIONS_PER_SESSION = 10;

type AnswerState = "unanswered" | "correct" | "wrong";

interface QuizState {
  phase: "select" | "playing" | "result";
  level: QuizLevel;
  questions: QuizQuestion[];
  current: number;
  score: number;
  answerState: AnswerState;
  selectedChoice: string | null;
  timeLeft: number;
  results: { kanji: string; correct: string; selected: string | null; ok: boolean }[];
}

export default function KanjiQuiz({ isPremium, onOpenPayjp }: KanjiQuizProps) {
  const [state, setState] = useState<QuizState>({
    phase: "select",
    level: "N5",
    questions: [],
    current: 0,
    score: 0,
    answerState: "unanswered",
    selectedChoice: null,
    timeLeft: TIME_PER_QUESTION,
    results: [],
  });

  // Timer countdown
  useEffect(() => {
    if (state.phase !== "playing" || state.answerState !== "unanswered") return;
    if (state.timeLeft <= 0) {
      // Time's up — mark wrong
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => {
      setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);
    return () => clearTimeout(t);
  }, [state.phase, state.answerState, state.timeLeft]);

  const startQuiz = (level: QuizLevel) => {
    const questions = getQuizQuestions(level, QUESTIONS_PER_SESSION);
    setState({
      phase: "playing",
      level,
      questions,
      current: 0,
      score: 0,
      answerState: "unanswered",
      selectedChoice: null,
      timeLeft: TIME_PER_QUESTION,
      results: [],
    });
  };

  const handleAnswer = useCallback(
    (choice: string | null) => {
      setState((prev) => {
        if (prev.answerState !== "unanswered") return prev;
        const q = prev.questions[prev.current];
        const ok = choice === q.correct;
        const newResults = [
          ...prev.results,
          { kanji: q.kanji, correct: q.correct, selected: choice, ok },
        ];
        return {
          ...prev,
          answerState: ok ? "correct" : "wrong",
          selectedChoice: choice,
          score: ok ? prev.score + 1 : prev.score,
          results: newResults,
        };
      });

      // After 1.2s, advance to next question
      setTimeout(() => {
        setState((prev) => {
          if (prev.current + 1 >= prev.questions.length) {
            return { ...prev, phase: "result" };
          }
          return {
            ...prev,
            current: prev.current + 1,
            answerState: "unanswered",
            selectedChoice: null,
            timeLeft: TIME_PER_QUESTION,
          };
        });
      }, 1200);
    },
    []
  );

  const handleShare = () => {
    const { score, level } = state;
    const levelLabel = QUIZ_LEVELS.find((l) => l.key === level)?.label ?? level;
    const text = `字玉JITAMAクイズ【${levelLabel}】${score}/${QUESTIONS_PER_SESSION}問正解！漢字の読み方テストやってみて👇 #字玉 #JITAMA #漢字クイズ`;
    const url = "https://jitama.vercel.app";
    if (navigator.share) {
      navigator.share({ title: "字玉 JITAMA", text, url });
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      );
    }
  };

  // ── Level Select ──────────────────────────────────────────────────────────
  if (state.phase === "select") {
    return (
      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">🎌</div>
          <h2 className="text-lg font-bold text-white">漢字クイズモード</h2>
          <p className="text-xs text-purple-300 mt-1">読み方を選んで答えよう！ · {QUESTIONS_PER_SESSION}問 · {TIME_PER_QUESTION}秒制限</p>
        </div>
        <div className="space-y-3">
          {QUIZ_LEVELS.map((lvl) => {
            const locked = !lvl.free && !isPremium;
            return (
              <button
                key={lvl.key}
                onClick={() => {
                  if (locked) { onOpenPayjp(); return; }
                  startQuiz(lvl.key);
                }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                  locked
                    ? "border-amber-700/50 bg-amber-900/20 hover:bg-amber-900/30"
                    : "border-purple-700 bg-white/5 hover:bg-white/10 hover:border-purple-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${lvl.color}`}>
                    {lvl.label}
                  </span>
                  <span className="text-sm text-purple-200">
                    {lvl.key === "N5" ? "基本漢字" : lvl.key === "N4" ? "初〜中級" : lvl.key === "N3" ? "難読・自然" : "難読・地名"}
                  </span>
                </div>
                {locked ? (
                  <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">⭐ プレミアム</span>
                ) : (
                  <span className="text-purple-400 text-lg">→</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  if (state.phase === "playing") {
    const q = state.questions[state.current];
    const progress = ((state.current) / state.questions.length) * 100;
    const timerPct = (state.timeLeft / TIME_PER_QUESTION) * 100;

    return (
      <div className="w-full max-w-[400px] mx-auto px-4 py-4">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-purple-400">{state.current + 1} / {state.questions.length}</span>
          <span className="text-xs text-yellow-300 font-bold">{state.score}問正解</span>
        </div>
        <div className="w-full h-1.5 bg-purple-900 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Timer bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${timerPct > 50 ? "bg-green-500" : timerPct > 25 ? "bg-yellow-400" : "bg-red-500"}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Kanji */}
        <div
          className={`bg-white/5 border rounded-2xl flex items-center justify-center mb-6 transition-colors ${
            state.answerState === "correct"
              ? "border-green-500 bg-green-900/20"
              : state.answerState === "wrong"
              ? "border-red-500 bg-red-900/20"
              : "border-purple-700"
          }`}
          style={{ height: 160 }}
        >
          <div className="text-center">
            <div className="text-7xl font-bold text-white">{q.kanji}</div>
            {state.answerState !== "unanswered" && (
              <div className="mt-2 text-sm text-purple-300">{q.meaning}</div>
            )}
          </div>
        </div>

        {/* Feedback badge */}
        {state.answerState !== "unanswered" && (
          <div className={`text-center text-lg font-bold mb-3 ${state.answerState === "correct" ? "text-green-400" : "text-red-400"}`}>
            {state.answerState === "correct" ? "✓ 正解！" : `✗ 正解: ${q.correct}`}
          </div>
        )}

        {/* Choices */}
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice) => {
            const isSelected = state.selectedChoice === choice;
            const isCorrect = choice === q.correct;
            let cls = "border-purple-800 bg-white/5 hover:bg-white/10 hover:border-purple-600 text-purple-100";
            if (state.answerState !== "unanswered") {
              if (isCorrect) cls = "border-green-500 bg-green-900/30 text-green-200";
              else if (isSelected && !isCorrect) cls = "border-red-500 bg-red-900/30 text-red-200";
              else cls = "border-purple-900 bg-white/2 text-purple-600";
            }
            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                disabled={state.answerState !== "unanswered"}
                className={`border rounded-xl py-4 text-lg font-bold transition-all ${cls} disabled:cursor-default`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Timer */}
        <div className={`text-center mt-4 text-sm font-bold ${state.timeLeft <= 3 ? "text-red-400 animate-pulse" : "text-purple-400"}`}>
          {state.answerState === "unanswered" ? `${state.timeLeft}秒` : ""}
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  const pct = Math.round((state.score / QUESTIONS_PER_SESSION) * 100);
  const rank = pct >= 90 ? { label: "満点マスター！", color: "text-yellow-300", emoji: "🏆" }
    : pct >= 70 ? { label: "上級者！", color: "text-green-400", emoji: "⭐" }
    : pct >= 50 ? { label: "中級者！", color: "text-blue-400", emoji: "📗" }
    : { label: "もう一度チャレンジ！", color: "text-purple-300", emoji: "📖" };

  return (
    <div className="w-full max-w-[400px] mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{rank.emoji}</div>
        <div className={`text-xl font-bold ${rank.color}`}>{rank.label}</div>
        <div className="text-4xl font-black text-white mt-2">
          {state.score}<span className="text-xl text-purple-400">/{QUESTIONS_PER_SESSION}</span>
        </div>
        <div className="text-purple-300 text-sm mt-1">正解率 {pct}%</div>
      </div>

      {/* Answer review */}
      <div className="bg-white/5 border border-purple-800 rounded-2xl p-4 mb-4 space-y-2 max-h-48 overflow-y-auto">
        {state.results.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-white font-bold text-xl w-12 text-center">{r.kanji}</span>
            <span className="text-purple-300 flex-1 text-center">{r.correct}</span>
            <span className={r.ok ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
              {r.ok ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleShare}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl mb-3"
      >
        スコアをXでシェア 🐦
      </button>
      <button
        onClick={() => setState((prev) => ({ ...prev, phase: "select" }))}
        className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-xl"
      >
        レベルを選んでもう一度
      </button>
    </div>
  );
}
