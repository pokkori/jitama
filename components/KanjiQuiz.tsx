"use client";

import { useState, useEffect, useCallback } from "react";
import { getQuizQuestions, type QuizQuestion } from "@/lib/quiz-data";

//  苦手漢字リスト 
const WEAK_KANJI_KEY = "jitama_weak_kanji";

interface WeakKanji {
  kanji: string;
  correct: string;
  meaning: string;
  wrongCount: number;
  lastSeen: string;
}

function loadWeakKanji(): WeakKanji[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(WEAK_KANJI_KEY) ?? "[]"); } catch { return []; }
}

function recordWeakKanji(kanji: string, correct: string, meaning: string): WeakKanji[] {
  const list = loadWeakKanji();
  const idx = list.findIndex(w => w.kanji === kanji);
  if (idx >= 0) {
    list[idx].wrongCount += 1;
    list[idx].lastSeen = new Date().toLocaleDateString("ja-JP");
  } else {
    list.push({ kanji, correct, meaning, wrongCount: 1, lastSeen: new Date().toLocaleDateString("ja-JP") });
  }
  // 最大50件
  const sorted = list.sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 50);
  localStorage.setItem(WEAK_KANJI_KEY, JSON.stringify(sorted));
  return sorted;
}

//  クイズ成績履歴 
const QUIZ_HISTORY_KEY = "jitama_quiz_history";
interface QuizHistoryEntry {
  level: string;
  score: number;
  total: number;
  pct: number;
  date: string;
}

function loadQuizHistory(): QuizHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQuizHistory(entry: QuizHistoryEntry): QuizHistoryEntry[] {
  const history = loadQuizHistory();
  const next = [entry, ...history].slice(0, 20);
  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next));
  return next;
}

function QuizHistoryGraph({ history }: { history: QuizHistoryEntry[] }) {
  if (history.length === 0) return null;
  const recent = history.slice(0, 8).reverse();
  const avg = Math.round(recent.reduce((s, h) => s + h.pct, 0) / recent.length);
  const best = Math.max(...recent.map(h => h.pct));
  return (
    <div className="bg-white/5 border border-purple-800/50 rounded-2xl p-4 mb-4">
      <p className="text-xs text-purple-400 font-bold mb-3"> 成績の推移（最新{recent.length}回）</p>
      <div className="flex items-end gap-1.5 h-16 mb-2">
        {recent.map((h, i) => {
          const color = h.pct >= 80 ? "#fbbf24" : h.pct >= 60 ? "#a78bfa" : "#6b7280";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-bold" style={{ color }}>{h.pct}%</span>
              <div className="w-full rounded-t transition-all" style={{ height: `${h.pct}%`, backgroundColor: color, minHeight: 3 }} />
              <span className="text-[7px] text-purple-600 leading-none">{h.date.slice(5)}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 justify-center text-center">
        <div className="flex-1 bg-purple-900/30 rounded-lg p-2">
          <p className="text-lg font-black text-yellow-300">{avg}%</p>
          <p className="text-[9px] text-purple-500">平均正解率</p>
        </div>
        <div className="flex-1 bg-purple-900/30 rounded-lg p-2">
          <p className="text-lg font-black text-green-400">{best}%</p>
          <p className="text-[9px] text-purple-500">ベスト</p>
        </div>
        <div className="flex-1 bg-purple-900/30 rounded-lg p-2">
          <p className="text-lg font-black text-purple-300">{recent.length}</p>
          <p className="text-[9px] text-purple-500">受験回数</p>
        </div>
      </div>
    </div>
  );
}

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
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>([]);
  const [weakKanjiList, setWeakKanjiList] = useState<WeakKanji[]>([]);
  const [showWeakList, setShowWeakList] = useState(false);

  useEffect(() => {
    setQuizHistory(loadQuizHistory());
    setWeakKanjiList(loadWeakKanji());
  }, []);

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

      // 不正解なら苦手漢字に記録
    setState((prev) => {
      const q = prev.questions[prev.current];
      if (choice !== q.correct) {
        const updated = recordWeakKanji(q.kanji, q.correct, q.meaning);
        setWeakKanjiList(updated);
      }
      return prev;
    });

      // After 1.2s, advance to next question
      setTimeout(() => {
        setState((prev) => {
          if (prev.current + 1 >= prev.questions.length) {
            // 成績を履歴に保存
            const finalScore = prev.score + (choice === prev.questions[prev.current]?.correct ? 1 : 0);
            const pct = Math.round((finalScore / QUESTIONS_PER_SESSION) * 100);
            const entry: QuizHistoryEntry = {
              level: prev.level,
              score: finalScore,
              total: QUESTIONS_PER_SESSION,
              pct,
              date: new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            };
            const updated = saveQuizHistory(entry);
            setQuizHistory(updated);
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
    const text = `字玉JITAMAクイズ【${levelLabel}】${score}/${QUESTIONS_PER_SESSION}問正解！漢字の読み方テストやってみて #字玉 #JITAMA #漢字クイズ`;
    const url = "https://jitama.vercel.app";
    if (navigator.share) {
      navigator.share({ title: "字玉 JITAMA", text, url });
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      );
    }
  };

  // 苦手漢字クイズ開始
  const startWeakKanjiQuiz = () => {
    if (weakKanjiList.length === 0) return;
    const weakQuestions: import("@/lib/quiz-data").QuizQuestion[] = weakKanjiList.slice(0, QUESTIONS_PER_SESSION).map((w) => {
      const others = weakKanjiList.filter(x => x.kanji !== w.kanji).map(x => x.correct);
      const shuffled = [...new Set(others)].sort(() => Math.random() - 0.5).slice(0, 3);
      const choices = [...shuffled, w.correct].sort(() => Math.random() - 0.5);
      return { kanji: w.kanji, correct: w.correct, choices: choices.length >= 4 ? choices : [w.correct, "やま", "かわ", "ひと"].slice(0, 4), jlpt: "N5" as const, meaning: w.meaning };
    });
    setState({ phase: "playing", level: "N5", questions: weakQuestions, current: 0, score: 0, answerState: "unanswered", selectedChoice: null, timeLeft: TIME_PER_QUESTION, results: [] });
    setShowWeakList(false);
  };

  //  Level Select 
  if (state.phase === "select") {
    return (
      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="text-2xl mb-1"></div>
          <h2 className="text-lg font-bold text-white">漢字クイズモード</h2>
          <p className="text-xs text-purple-300 mt-1">読み方を選んで答えよう！ · {QUESTIONS_PER_SESSION}問 · {TIME_PER_QUESTION}秒制限</p>
        </div>
        {/* 苦手漢字リストボタン */}
        {weakKanjiList.length > 0 && (
          <button
            onClick={() => setShowWeakList(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-red-700/60 bg-red-900/20 hover:bg-red-900/30 transition-all mb-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white px-2 py-1 rounded-full bg-red-600">苦手</span>
              <span className="text-sm text-red-200">苦手漢字を復習する（{weakKanjiList.length}字）</span>
            </div>
            <span className="text-red-400 text-lg">→</span>
          </button>
        )}
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
                  <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold"> プレミアム</span>
                ) : (
                  <span className="text-purple-400 text-lg">→</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 苦手漢字リストパネル */}
        {showWeakList && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a0a2e] border border-red-700/60 rounded-2xl p-5 max-w-sm w-full max-h-[80vh] flex flex-col">
              <div className="text-center mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" className="mx-auto mb-1" aria-hidden="true">
                  <path d="M14 3L25 9.5v9L14 25 3 18.5v-9L14 3z" fill="none" stroke="#ef4444" strokeWidth="2"/>
                  <text x="14" y="19" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">苦</text>
                </svg>
                <h3 className="text-base font-bold text-white">苦手漢字リスト</h3>
                <p className="text-xs text-red-300 mt-1">間違えた漢字をまとめて復習しよう</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {weakKanjiList.slice(0, 20).map((w, i) => (
                  <div key={i} className="flex items-center gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2">
                    <span className="text-2xl font-bold text-white w-10 text-center">{w.kanji}</span>
                    <div className="flex-1">
                      <p className="text-xs text-red-200 font-bold">{w.correct}</p>
                      <p className="text-[10px] text-red-500">{w.meaning}</p>
                    </div>
                    <span className="text-[10px] bg-red-800/60 text-red-300 px-2 py-0.5 rounded-full">{w.wrongCount}回ミス</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startWeakKanjiQuiz}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  苦手だけ出題する →
                </button>
                <button
                  onClick={() => setShowWeakList(false)}
                  className="text-xs text-purple-500 hover:text-purple-400 px-3"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  //  Playing 
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
            {state.answerState === "correct" ? " 正解！" : ` 正解: ${q.correct}`}
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

  //  Result 
  const pct = Math.round((state.score / QUESTIONS_PER_SESSION) * 100);
  const rank = pct >= 90 ? { label: "満点マスター！", color: "text-yellow-300", emoji: "" }
    : pct >= 70 ? { label: "上級者！", color: "text-green-400", emoji: "" }
    : pct >= 50 ? { label: "中級者！", color: "text-blue-400", emoji: "" }
    : { label: "もう一度チャレンジ！", color: "text-purple-300", emoji: "" };

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

      {/* 成績履歴グラフ */}
      <QuizHistoryGraph history={quizHistory} />

      {/* Answer review */}
      <div className="bg-white/5 border border-purple-800 rounded-2xl p-4 mb-4 space-y-2 max-h-48 overflow-y-auto">
        {state.results.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-white font-bold text-xl w-12 text-center">{r.kanji}</span>
            <span className="text-purple-300 flex-1 text-center">{r.correct}</span>
            <span className={r.ok ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
              {r.ok ? "" : ""}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleShare}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl mb-3"
      >
        スコアをXでシェア 
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
