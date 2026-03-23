"use client";

import { useEffect, useRef, useState } from "react";
import { KANJI_LEVELS, randomNextLevel } from "@/lib/kanji-data";
import { type JlptLevel, JLPT_MODES } from "@/lib/jlpt";
import { useGameSounds } from "@/hooks/useGameSounds";
import LocalRanking, {
  type RankingEntry,
  loadRanking,
  saveToRanking,
  resetRanking,
} from "@/components/LocalRanking";
import { getRankFromScore, getRankProgress, didRankUp } from "@/lib/ranking-utils";

// ─── 漢字合体 成り立ちデータ ────────────────────────────────────────────────
interface MergeKnowledge {
  before1: string;
  before2: string;
  after: string;
  reading: string;
  trivia: string;
}

// level → 合体前の2文字の知識（newLevel = mergedLevel なので、前は newLevel - 1）
const MERGE_KNOWLEDGE: Record<number, MergeKnowledge> = {
  1: { before1: "一", before2: "一", after: "二", reading: "に", trivia: "一を二本重ねた形。数の始まり" },
  2: { before1: "二", before2: "二", after: "三", reading: "さん", trivia: "横線を三本並べた象形文字" },
  3: { before1: "三", before2: "三", after: "十", reading: "じゅう", trivia: "縦と横の線が交わる十字の形" },
  4: { before1: "十", before2: "十", after: "木", reading: "き・もく", trivia: "幹と枝と根を持つ木の象形文字" },
  5: { before1: "木", before2: "木", after: "林", reading: "はやし・りん", trivia: "木が二本で小さな森。林業のりん" },
  6: { before1: "林", before2: "林", after: "森", reading: "もり・しん", trivia: "木が三本以上集まって大きな森に" },
  7: { before1: "森", before2: "森", after: "日", reading: "ひ・にち", trivia: "太陽の丸い形を表す象形文字" },
  8: { before1: "日", before2: "日", after: "明", reading: "あかるい・めい", trivia: "日（太陽）と月が並んで明るい！" },
  9: { before1: "明", before2: "明", after: "晶", reading: "しょう", trivia: "日が三つで輝く・キラキラ光る" },
  10: { before1: "晶", before2: "晶", after: "品", reading: "しな・ひん", trivia: "口が三つ並んで品質・品物を表す" },
  11: { before1: "品", before2: "品", after: "字", reading: "じ・あざ", trivia: "「子」が「宀（屋根）」の下で学ぶ＝文字" },
};

// ─── デイリーランキング（localStorage） ────────────────────────────────────────

interface DailyRankingEntry {
  score: number;
  nickname: string;
  time: string;
}

function saveDailyRanking(score: number, nickname: string): void {
  const today = new Date().toISOString().split('T')[0];
  const key = `kanji_rankings_${today}`;
  try {
    const existing: DailyRankingEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ score, nickname, time: new Date().toISOString() });
    existing.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
  } catch { /* noop */ }
}

function getTopDailyRankings(limit = 10): DailyRankingEntry[] {
  const today = new Date().toISOString().split('T')[0];
  try {
    const data: DailyRankingEntry[] = JSON.parse(localStorage.getItem(`kanji_rankings_${today}`) || '[]');
    return data.slice(0, limit);
  } catch { return []; }
}

function getDailyRank(score: number): number | null {
  const rankings = getTopDailyRankings(50);
  const idx = rankings.findIndex(r => r.score <= score);
  if (idx === -1 && rankings.length === 0) return 1;
  if (idx === -1) return rankings.length + 1;
  return idx + 1;
}

// ─── ストリーク ─────────────────────────────────────────────────────────────

function getStreakData(): { streak: number; lastDate: string } {
  try {
    return JSON.parse(localStorage.getItem("jitama_streak") ?? "{}") ?? { streak: 0, lastDate: "" };
  } catch { return { streak: 0, lastDate: "" }; }
}

function updateStreak(): { streak: number; isNew: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const data = getStreakData();
  if (data.lastDate === today) return { streak: data.streak, isNew: false };
  const newStreak = data.lastDate === yesterday ? data.streak + 1 : 1;
  localStorage.setItem("jitama_streak", JSON.stringify({ streak: newStreak, lastDate: today }));
  return { streak: newStreak, isNew: true };
}

// ─── デイリーチャレンジ (日付seed) ───────────────────────────────────────────

function getDailyChallengeTarget(): number {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  // 1000〜4000の間でdaily target
  return 1000 + (seed % 11) * 300;
}

function getDailyChallengeStatus(): { target: number; best: number; cleared: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  const target = getDailyChallengeTarget();
  try {
    const data = JSON.parse(localStorage.getItem("jitama_daily_challenge") ?? "{}");
    if (data.date === today) {
      return { target, best: data.best ?? 0, cleared: (data.best ?? 0) >= target };
    }
  } catch { /* */ }
  return { target, best: 0, cleared: false };
}

function saveDailyChallengeScore(score: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const current = getDailyChallengeStatus();
  if (score > current.best) {
    localStorage.setItem("jitama_daily_challenge", JSON.stringify({ date: today, best: score }));
  }
}

// ─── シェアカウント（localStorageベースの擬似カウント）──────────────────────

function getShareCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const data = JSON.parse(localStorage.getItem("jitama_share_count") ?? "{}");
    if (data.date !== today) return getBaseShareCount();
    return (data.count ?? 0) + getBaseShareCount();
  } catch { return getBaseShareCount(); }
}

function incrementShareCount(): void {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const data = JSON.parse(localStorage.getItem("jitama_share_count") ?? "{}");
    const count = data.date === today ? (data.count ?? 0) + 1 : 1;
    localStorage.setItem("jitama_share_count", JSON.stringify({ date: today, count }));
  } catch { /* noop */ }
}

function getBaseShareCount(): number {
  // seed-based pseudo count (varies by day, looks realistic)
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return 127 + (seed % 389); // 127-515人
}

interface MergeHint {
  char: string;
  reading: string;
  meaning: string;
  jlpt: string;
  id: number;
}

// 合体アニメ演出モーダル
interface MergeAnimation {
  id: number;
  level: number; // mergedLevel
  knowledge: MergeKnowledge | null;
}

// コンボ状態
interface ComboState {
  count: number;
  lastMergeAt: number; // timestamp
}

interface GameState {
  score: number;
  nextLevel: number;
  gameOver: boolean;
  highScore: number;
  prevHighScore: number; // ゲーム前のハイスコア（段位アップ判定用）
  mergeHint: MergeHint | null;
  ranking: RankingEntry[];
  newRank: number | null; // 今回の順位（null = ランク外 or まだゲーム中）
  showRankUpBanner: boolean; // 段位アップバナー表示フラグ
  pendingScore: number | null; // ニックネーム入力待ちのスコア
  nicknameSaved: boolean; // ニックネーム登録完了フラグ
}

interface StreakState {
  streak: number;
  showBanner: boolean;
}

interface DailyChallenge {
  target: number;
  best: number;
  cleared: boolean;
}

interface KanjiGameProps {
  /** Called when the game ends (used for play count tracking) */
  onGameOver?: (score: number) => void;
  /** JLPT mode filter — affects badge display and future kanji filtering */
  jlptMode?: JlptLevel;
}

// ─── Phaser Scene ────────────────────────────────────────────────────────────

function createGameScene(
  onScoreUpdate: (score: number) => void,
  onNextPiece: (level: number) => void,
  onGameOver: (score: number) => void,
  onMerge: (level: number) => void
) {
  // We import Phaser types dynamically so we cast as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class KanjiScene extends (window as any).Phaser.Scene {
    // game state
    private currentBody: MatterJS.BodyType | null = null;
    private currentGfx: Phaser.GameObjects.Container | null = null;
    private currentLevel = 0;
    private nextLevel = 0;
    private score = 0;
    private canDrop = true;
    private gameOver = false;
    private merging = new Set<number>(); // body IDs mid-merge
    private aimGfx!: Phaser.GameObjects.Graphics;
    private dangerLine!: Phaser.GameObjects.Graphics;
    private pointerX = 200;

    // dimensions
    private W = 400;
    private H = 620;
    private WALL = 10;
    private DANGER_Y = 90;   // game over line (px from top of canvas)
    private DROP_Y = 50;     // where preview piece hovers (above danger line)

    constructor() {
      super({ key: "KanjiScene" });
    }

    preload() {}

    create() {
      // Background gradient
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x2d1b69, 0x2d1b69, 1);
      bg.fillRect(0, 0, this.W, this.H);

      // Walls (invisible physics bodies)
      const wallOpts = { isStatic: true, label: "wall", friction: 0.3, restitution: 0.1 };
      this.matter.add.rectangle(this.W / 2, this.H + 5, this.W, 10, wallOpts); // floor
      this.matter.add.rectangle(-5, this.H / 2, 10, this.H, wallOpts); // left
      this.matter.add.rectangle(this.W + 5, this.H / 2, 10, this.H, wallOpts); // right

      // Aim line graphic
      this.aimGfx = this.add.graphics();

      // Danger line
      this.dangerLine = this.add.graphics();
      this.dangerLine.lineStyle(2, 0xff4444, 0.6);
      this.dangerLine.lineBetween(0, this.DANGER_Y, this.W, this.DANGER_Y);

      // "DANGER" label
      this.add.text(4, this.DANGER_Y - 18, "▼ ここまでいったらゲームオーバー", {
        fontSize: "10px",
        color: "#ff6666",
        alpha: 0.8,
      } as Phaser.Types.GameObjects.Text.TextStyle);

      // Collision handling
      this.matter.world.on(
        "collisionstart",
        (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
          const pairs = event.pairs;
          for (const pair of pairs) {
            this.handleCollision(pair.bodyA, pair.bodyB);
          }
        }
      );

      // Input
      this.input.on("pointermove", (ptr: Phaser.Input.Pointer) => {
        this.pointerX = Phaser.Math.Clamp(ptr.x, this.WALL + 20, this.W - this.WALL - 20);
      });

      this.input.on("pointerdown", () => {
        if (this.canDrop && !this.gameOver) this.dropPiece();
      });

      // Spawn first piece
      this.nextLevel = randomNextLevel();
      this.spawnPreview();
    }

    // ── Spawn hovering preview piece ──────────────────────────────────────────

    private spawnPreview() {
      this.currentLevel = this.nextLevel;
      this.nextLevel = randomNextLevel();
      onNextPiece(this.nextLevel);

      const kl = KANJI_LEVELS[this.currentLevel];
      this.currentGfx = this.createKanjiContainer(
        this.pointerX,
        this.DROP_Y,
        kl.level,
        false
      );
      this.currentBody = null; // no physics yet
      this.canDrop = true;
    }

    // ── Drop the preview piece (give it physics) ───────────────────────────

    private dropPiece() {
      if (!this.currentGfx) return;
      this.canDrop = false;

      const kl = KANJI_LEVELS[this.currentLevel];
      const x = this.pointerX;
      const body = this.matter.add.circle(x, this.DROP_Y, kl.radius, {
        restitution: 0.2,
        friction: 0.5,
        frictionAir: 0.01,
        label: `kanji_${this.currentLevel}`,
        collisionFilter: { category: 1, mask: 1 },
      }) as unknown as MatterJS.BodyType;

      // Store level and creation time on body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).kanjiLevel = this.currentLevel;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).createdAt = Date.now();

      // Attach container to track body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).gfx = this.currentGfx;

      this.currentGfx = null;
      this.currentBody = body;

      // After piece settles (~1.2s) spawn next
      this.time.delayedCall(1200, () => {
        if (!this.gameOver) this.spawnPreview();
      });
    }

    // ── Create a kanji visual container ───────────────────────────────────────

    private createKanjiContainer(
      x: number,
      y: number,
      level: number,
      hasShadow: boolean
    ): Phaser.GameObjects.Container {
      const kl = KANJI_LEVELS[level];
      const r = kl.radius;

      const gfx = this.add.graphics();

      // Shadow
      if (hasShadow) {
        gfx.fillStyle(0x000000, 0.2);
        gfx.fillCircle(3, 3, r);
      }

      // Outer ring
      gfx.fillStyle(0xffffff, 0.15);
      gfx.fillCircle(0, 0, r);

      // Main fill
      gfx.fillStyle(kl.color, 1);
      gfx.fillCircle(0, 0, r - 2);

      // Glossy highlight
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillEllipse(-r * 0.2, -r * 0.3, r * 0.5, r * 0.3);

      // Kanji text
      const txt = this.add.text(0, 0, kl.char, {
        fontSize: `${Math.floor(r * 0.85)}px`,
        fontFamily: '"Hiragino Kaku Gothic ProN", "Noto Sans JP", serif',
        color: "#1a0a2e",
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 2,
      } as Phaser.Types.GameObjects.Text.TextStyle);
      txt.setOrigin(0.5, 0.5);

      const container = this.add.container(x, y, [gfx, txt]);
      return container;
    }

    // ── Collision: check merge ─────────────────────────────────────────────────

    private handleCollision(a: MatterJS.BodyType, b: MatterJS.BodyType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aLevel = (a as any).kanjiLevel;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bLevel = (b as any).kanjiLevel;

      if (aLevel === undefined || bLevel === undefined) return;
      if (aLevel !== bLevel) return;
      if (aLevel >= KANJI_LEVELS.length - 1) return; // max level, no merge
      if (this.merging.has(a.id) || this.merging.has(b.id)) return;

      this.merging.add(a.id);
      this.merging.add(b.id);

      // Midpoint
      const mx = (a.position.x + b.position.x) / 2;
      const my = (a.position.y + b.position.y) / 2;
      const newLevel = aLevel + 1;

      // Small delay for visual pop
      this.time.delayedCall(60, () => {
        // Remove old bodies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gfxA = (a as any).gfx as Phaser.GameObjects.Container | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gfxB = (b as any).gfx as Phaser.GameObjects.Container | undefined;
        gfxA?.destroy();
        gfxB?.destroy();

        this.matter.world.remove(a as unknown as MatterJS.Body);
        this.matter.world.remove(b as unknown as MatterJS.Body);

        this.merging.delete(a.id);
        this.merging.delete(b.id);

        // Pop effect
        this.cameras.main.shake(60, 0.005);

        // Spawn merged piece
        this.spawnMergedPiece(mx, my, newLevel);

        // Update score
        const pts = KANJI_LEVELS[newLevel].score;
        this.score += pts;
        onScoreUpdate(this.score);
        onMerge(newLevel);
      });
    }

    // ── Spawn a merged piece with physics ─────────────────────────────────────

    private spawnMergedPiece(x: number, y: number, level: number) {
      const kl = KANJI_LEVELS[level];
      const clampedX = Phaser.Math.Clamp(x, this.WALL + kl.radius, this.W - this.WALL - kl.radius);

      const body = this.matter.add.circle(clampedX, y, kl.radius, {
        restitution: 0.2,
        friction: 0.5,
        frictionAir: 0.01,
        label: `kanji_${level}`,
      }) as unknown as MatterJS.BodyType;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).kanjiLevel = level;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).createdAt = Date.now();

      const gfx = this.createKanjiContainer(clampedX, y, level, true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).gfx = gfx;
    }

    // ── Update loop ───────────────────────────────────────────────────────────

    update() {
      if (this.gameOver) return;

      // Move preview piece with pointer
      if (this.canDrop && this.currentGfx) {
        this.currentGfx.x = this.pointerX;

        // Draw aim line
        this.aimGfx.clear();
        this.aimGfx.lineStyle(1, 0xffffff, 0.25);
        this.aimGfx.lineBetween(this.pointerX, this.DROP_Y + 10, this.pointerX, this.H);
      } else {
        this.aimGfx.clear();
      }

      // Sync containers to physics bodies
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.matter.world.getAllBodies().forEach((body: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyBody = body as any;
        const gfx = anyBody.gfx as Phaser.GameObjects.Container | undefined;
        if (gfx && !gfx.scene) return; // destroyed
        if (gfx) {
          gfx.x = body.position.x;
          gfx.y = body.position.y;
          gfx.rotation = body.angle;
        }

        // Game over check: settled piece above danger line
        // Grace period: ignore pieces created within last 2s (still falling)
        if (!body.isStatic && anyBody.kanjiLevel !== undefined && !this.gameOver) {
          const age = Date.now() - (anyBody.createdAt ?? Date.now());
          if (age > 2000) {
            const radius = KANJI_LEVELS[anyBody.kanjiLevel]?.radius ?? 0;
            // Game over when the CENTER of a settled piece is above danger line
            if (body.position.y < this.DANGER_Y + radius) {
              const settled =
                Math.abs(body.velocity.y) < 0.3 &&
                Math.abs(body.velocity.x) < 0.3;
              if (settled) {
                this.triggerGameOver();
              }
            }
          }
        }
      });
    }

    private triggerGameOver() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.canDrop = false;
      this.matter.world.pause();

      // Flash overlay
      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0);
      overlay.fillRect(0, 0, this.W, this.H);
      this.tweens.add({
        targets: overlay,
        alpha: 0.7,
        duration: 600,
        onComplete: () => onGameOver(this.score),
      });

      this.add
        .text(this.W / 2, this.H / 2 - 30, "GAME OVER", {
          fontSize: "36px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#ff4444",
          strokeThickness: 4,
        } as Phaser.Types.GameObjects.Text.TextStyle)
        .setOrigin(0.5);

      this.add
        .text(this.W / 2, this.H / 2 + 20, `スコア: ${this.score}`, {
          fontSize: "24px",
          color: "#fbbf24",
        } as Phaser.Types.GameObjects.Text.TextStyle)
        .setOrigin(0.5);
    }
  };
}

const JITAMA_MAX_LEVEL = 11; // 「字」が最大レベル

// ─── JLPT進捗バー ─────────────────────────────────────────────────────────────

const JLPT_LEVELS = [
  { level: "N5", threshold: 0, color: "bg-green-400" },
  { level: "N4", threshold: 500, color: "bg-blue-400" },
  { level: "N3", threshold: 1500, color: "bg-yellow-400" },
  { level: "N2", threshold: 3000, color: "bg-orange-400" },
  { level: "N1", threshold: 6000, color: "bg-red-500" },
];

function getJlptLevel(score: number) {
  let current = JLPT_LEVELS[0];
  let next: typeof JLPT_LEVELS[0] | null = JLPT_LEVELS[1];
  for (let i = JLPT_LEVELS.length - 1; i >= 0; i--) {
    if (score >= JLPT_LEVELS[i].threshold) {
      current = JLPT_LEVELS[i];
      next = JLPT_LEVELS[i + 1] ?? null;
      break;
    }
  }
  return { current, next };
}

function JLPTProgressBar({ score }: { score: number }) {
  const { current, next } = getJlptLevel(score);
  const progress = next
    ? Math.min(100, ((score - current.threshold) / (next.threshold - current.threshold)) * 100)
    : 100;
  return (
    <div className="px-4 py-2 bg-gray-800 rounded-lg mx-2 mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white">JLPT {current.level}</span>
        {next ? (
          <span className="text-xs text-gray-400">次: {next.level} (あと{next.threshold - score}pt)</span>
        ) : (
          <span className="text-xs text-yellow-400 font-bold">MAX LEVEL!</span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${current.color}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`JLPTレベル ${current.level} 進捗 ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
}

// ─── React Component ──────────────────────────────────────────────────────────

export default function KanjiGame({ onGameOver: onGameOverExternal, jlptMode = "all" }: KanjiGameProps = {}) {
  const currentModeInfo = JLPT_MODES.find((m) => m.key === jlptMode) ?? JLPT_MODES[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { playMerge, playGameOver, playHighScore } = useGameSounds();
  const hintIdRef = useRef(0);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showJiCelebration, setShowJiCelebration] = useState(false);
  const [jiShown, setJiShown] = useState(false);
  const [streakState, setStreakState] = useState<StreakState>({ streak: 0, showBanner: false });
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>({ target: 2000, best: 0, cleared: false });
  const [nickname, setNickname] = useState<string>("");
  // 合体アニメ演出
  const [mergeAnimation, setMergeAnimation] = useState<MergeAnimation | null>(null);
  const mergeAnimIdRef = useRef(0);
  const mergeAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // コンボカウンター
  const [comboState, setComboState] = useState<ComboState>({ count: 0, lastMergeAt: 0 });
  const [showCombo, setShowCombo] = useState(false);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 最後に合体した漢字（シェアテキスト用）
  const lastMergedCharRef = useRef<string>("");
  // 最高到達レベル（Wordleグリッド用）
  const highestLevelRef = useRef<number>(0);
  // シェアテキストコピー済みフラグ
  const [shareTextCopied, setShareTextCopied] = useState(false);
  const [state, setState] = useState<GameState>({
    score: 0,
    nextLevel: 0,
    gameOver: false,
    highScore: 0,
    prevHighScore: 0,
    mergeHint: null,
    ranking: [],
    newRank: null,
    showRankUpBanner: false,
    pendingScore: null,
    nicknameSaved: false,
  });

  // 初回チュートリアル表示
  useEffect(() => {
    const seen = localStorage.getItem("jitama_tutorial_seen");
    if (!seen) {
      setShowTutorial(true);
    }
    // ストリーク更新
    const { streak, isNew } = updateStreak();
    setStreakState({ streak, showBanner: isNew && streak >= 2 });
    if (isNew && streak >= 2) {
      setTimeout(() => setStreakState(s => ({ ...s, showBanner: false })), 3000);
    }
    // デイリーチャレンジ初期化
    setDailyChallenge(getDailyChallengeStatus());
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let game: Phaser.Game;

    // Dynamic import of Phaser (browser only)
    import("phaser").then((Phaser) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Phaser = Phaser.default;

      const Scene = createGameScene(
        (score) => {
          setState((prev) => ({
            ...prev,
            score,
            highScore: Math.max(prev.highScore, score),
          }));
        },
        (nextLevel) => setState((prev) => ({ ...prev, nextLevel })),
        (score) => {
          const hs = Number(localStorage.getItem("jitama_hs") ?? "0");
          const newHs = Math.max(hs, score);
          localStorage.setItem("jitama_hs", String(newHs));
          const isNewHighScore = score >= newHs && score > 0;
          if (isNewHighScore) playHighScore();
          else playGameOver();
          // デイリーチャレンジ更新
          saveDailyChallengeScore(score);
          setDailyChallenge(getDailyChallengeStatus());

          // 段位アップ判定
          const rankUp = didRankUp(hs, newHs);

          // ── ニックネーム入力待ちに移行（ランキング保存は名前入力後）──
          setState((prev) => ({
            ...prev,
            gameOver: true,
            highScore: newHs,
            prevHighScore: hs,
            ranking: loadRanking(),
            newRank: null,
            showRankUpBanner: rankUp,
            pendingScore: score,
            nicknameSaved: false,
          }));
          onGameOverExternal?.(score);
        },
        (level) => {
          playMerge(level);

          // 最後に合体した漢字を記録（シェアテキスト用）
          const mergedKl = KANJI_LEVELS[level];
          lastMergedCharRef.current = mergedKl.char;
          // 最高到達レベルを更新
          if (level > highestLevelRef.current) highestLevelRef.current = level;

          // ── コンボカウンター ───────────────────────────────────────────
          const now = Date.now();
          setComboState((prev) => {
            const isCombo = now - prev.lastMergeAt < 3000;
            const newCount = isCombo ? prev.count + 1 : 1;
            return { count: newCount, lastMergeAt: now };
          });
          setShowCombo(true);
          if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
          comboTimerRef.current = setTimeout(() => {
            setShowCombo(false);
            setComboState((prev) => ({ ...prev, count: 0 }));
          }, 2000);

          // ── 合体アニメ演出モーダル ─────────────────────────────────────
          const knowledge = MERGE_KNOWLEDGE[level] ?? null;
          const animId = ++mergeAnimIdRef.current;
          setMergeAnimation({ id: animId, level, knowledge });
          if (mergeAnimTimerRef.current) clearTimeout(mergeAnimTimerRef.current);
          mergeAnimTimerRef.current = setTimeout(() => {
            setMergeAnimation((prev) => (prev?.id === animId ? null : prev));
          }, 1800);

          // 「字」（最大レベル）到達チェック
          if (level >= JITAMA_MAX_LEVEL) {
            setJiShown((prev) => {
              if (!prev) {
                setTimeout(() => setShowJiCelebration(true), 300);
                return true;
              }
              return prev;
            });
          }
          // Show JLPT study hint in non-"all" modes
          if (jlptMode !== "all") {
            const kl = KANJI_LEVELS[level];
            const id = ++hintIdRef.current;
            setState((prev) => ({
              ...prev,
              mergeHint: {
                char: kl.char,
                reading: kl.reading,
                meaning: kl.meaning,
                jlpt: kl.jlpt,
                id,
              },
            }));
            if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
            hintTimerRef.current = setTimeout(() => {
              setState((prev) =>
                prev.mergeHint?.id === id ? { ...prev, mergeHint: null } : prev
              );
            }, 2000);
          }
        }
      );

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.default.AUTO,
        width: 400,
        height: 620,
        backgroundColor: "#1a0a2e",
        parent: containerRef.current!,
        physics: {
          default: "matter",
          matter: {
            gravity: { x: 0, y: 1.8 },
            debug: false,
          },
        },
        scene: [Scene],
        scale: {
          mode: Phaser.default.Scale.FIT,
          autoCenter: Phaser.default.Scale.CENTER_BOTH,
        },
      };

      game = new Phaser.default.Game(config);
      gameRef.current = game;

      // Load saved high score and ranking
      const hs = Number(localStorage.getItem("jitama_hs") ?? "0");
      const savedRanking = loadRanking();
      setState((prev) => ({ ...prev, highScore: hs, prevHighScore: hs, ranking: savedRanking }));
    });

    return () => {
      game?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    setState({ score: 0, nextLevel: 0, gameOver: false, highScore: state.highScore, prevHighScore: state.highScore, mergeHint: null, ranking: loadRanking(), newRank: null, showRankUpBanner: false, pendingScore: null, nicknameSaved: false });
    setNickname("");
    highestLevelRef.current = 0;
    setShareTextCopied(false);
    // Re-mount triggers useEffect
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // ─── Wordle方式 漢字レベル絵文字グリッド（5段階）───────────────────────
  // 到達レベルを5段階で🟩（到達）/🟨（あと1段階）/⬜（未到達）
  const buildWordleGrid = (highestLevel: number): string => {
    // 12レベル（0-11）を5段階にマッピング: 0-1, 2-3, 4-5, 6-7, 8-11
    const thresholds = [2, 4, 6, 8, 12]; // 各段階の到達レベル閾値
    return thresholds.map((threshold, i) => {
      const prevThreshold = i > 0 ? thresholds[i - 1] : 0;
      if (highestLevel >= threshold) return "🟩"; // この段階を到達済み
      if (highestLevel >= prevThreshold) return "🟨"; // あと1段階（現在この段階にいる）
      return "⬜"; // 未到達
    }).join("");
  };

  // シェアテキスト生成（Wordle方式）
  const buildShareText = (): string => {
    const hl = highestLevelRef.current;
    const reachedChar = KANJI_LEVELS[Math.min(hl, KANJI_LEVELS.length - 1)]?.char ?? "一";
    const grid = buildWordleGrid(hl);
    const dc = getDailyChallengeStatus();
    const dayNumber = Math.floor((Date.now() - new Date("2026-01-01").getTime()) / 86400000);
    const today = new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    const cleared = dc.cleared;
    const statusLine = cleared
      ? `到達: ${reachedChar} / ${dc.best.toLocaleString()}pt クリア!`
      : `到達: ${reachedChar} / 目標までもう一歩!`;
    return `字玉 #${dayNumber} ${grid}\n${statusLine}\njitama.vercel.app #字玉`;
  };

  // コピー&シェアカウント記録
  const handleCopyShareText = async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setShareTextCopied(true);
      // シェアカウントをlocalStorageでインクリメント
      incrementShareCount();
    } catch {
      // フォールバック: テキストエリア経由コピー
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setShareTextCopied(true);
      incrementShareCount();
    }
  };

  // 旧方式（後方互換 — handleShareで引き続き使う）
  const buildDailyChallengeEmoji = (score: number, target: number): string => {
    const pct = score / target;
    const filled = Math.min(5, Math.round(pct * 5));
    const blocks = Array.from({ length: 5 }, (_, i) => {
      if (i < filled) {
        return filled === 5 ? "🟩" : "🟨";
      }
      return "⬛";
    }).join("");
    return blocks;
  };

  const handleShare = () => {
    const isHighScore = state.score >= state.highScore && state.score > 0;
    const currentRank = getRankFromScore(state.score);
    const modeLabel = jlptMode !== "all" ? `[${JLPT_MODES.find(m => m.key === jlptMode)?.label ?? jlptMode}] ` : "";
    const rankLabel = `${currentRank.icon}${currentRank.label}`;
    const dc = getDailyChallengeStatus();
    const emojiGrid = buildDailyChallengeEmoji(dc.best, dc.target);
    const today = new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    const dcLine = dc.cleared
      ? `📅 ${today}のチャレンジ: クリア！ ${emojiGrid}`
      : `📅 ${today}のチャレンジ: ${dc.best}/${dc.target}pt ${emojiGrid}`;
    // 最後に合体した漢字をシェアテキストに含める
    const lastChar = lastMergedCharRef.current;
    const charPart = lastChar ? `漢字「${lastChar}」まで合体！` : "";
    const dailyRank = getDailyRank(state.score);
    const rankLine = dailyRank ? `本日ランキング: ${dailyRank}位` : "";
    const text = isHighScore
      ? `【NEW記録🎉】字玉JITAMA ${charPart}スコア${state.score}点！${modeLabel}段位：${rankLabel}に到達！\n${rankLine}\n合体した漢字を見て漢字の意味が分かった🀄\n${dcLine}\n→ https://jitama.vercel.app #字玉JITAMA #漢字`
      : `字玉JITAMA ${charPart}スコア${state.score}点！${modeLabel}段位：${rankLabel}！\n${rankLine}\n合体した漢字を見て漢字の意味が分かった🀄\n${dcLine}\n→ https://jitama.vercel.app #字玉JITAMA #漢字`;
    const url = `https://jitama.vercel.app/share/${state.score}`;
    if (navigator.share) {
      navigator.share({ title: "字玉 JITAMA", text, url });
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      );
    }
  };

  const handleNicknameSubmit = () => {
    if (state.pendingScore === null) return;
    const name = nickname.trim() || "名無し";
    const entry: RankingEntry = {
      name,
      score: state.pendingScore,
      date: new Date().toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      level: jlptMode === "all" ? "全漢字" : jlptMode === "N5" ? "N5" : jlptMode === "N4" ? "N4" : "N3-N1",
    };
    const rank = saveToRanking(entry);
    const updatedRanking = loadRanking();
    // デイリーランキングにも保存
    saveDailyRanking(state.pendingScore, name);
    setState((prev) => ({
      ...prev,
      ranking: updatedRanking,
      newRank: rank,
      pendingScore: null,
      nicknameSaved: true,
    }));
  };

  // ─── 苦手漢字ミニクイズ（ゲームオーバー後） ───────────────────────────────
  const [weakQuizIdx, setWeakQuizIdx] = useState(0);
  const [weakQuizAnswer, setWeakQuizAnswer] = useState<string | null>(null);
  const weakEntries = Object.entries(MERGE_KNOWLEDGE);

  function getWeakQuizItem(idx: number) {
    const entry = weakEntries[idx % weakEntries.length];
    const knowledge = entry[1];
    // 4択: 正解 + ランダム3個
    const wrongReadings = weakEntries
      .filter((_, i) => i !== idx % weakEntries.length)
      .map(e => e[1].reading)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [knowledge.reading, ...wrongReadings].sort(() => Math.random() - 0.5);
    return { knowledge, choices, level: parseInt(entry[0]) };
  }

  const nextKanji = KANJI_LEVELS[state.nextLevel];

  const tutorialSteps = [
    { icon: "👆", title: "タップして漢字を落とそう", desc: "好きな位置をタップすると漢字ボールが落下します" },
    { icon: "✨", title: "同じ漢字が触れると合体！", desc: "同じ漢字同士が合体して次の漢字に進化します" },
    { icon: "🏆", title: "「字」を目指せ！", desc: "「一」から「字」まで12段階。最高漢字を出そう！" },
  ];

  const dailyChallengeProgress = Math.min(100, Math.round((dailyChallenge.best / dailyChallenge.target) * 100));

  // コンボカラー
  const getComboColor = (count: number): string => {
    if (count >= 4) return "#ef4444"; // 赤
    if (count >= 3) return "#f97316"; // オレンジ
    if (count >= 2) return "#eab308"; // 黄色
    return "#a78bfa"; // 紫（1コンボはほぼ非表示）
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1a0a2e] select-none">

      {/* CSS: 合体アニメ・コンボ用 */}
      <style>{`
        @keyframes merge-pop {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          70% { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.0); opacity: 0; }
        }
        @keyframes bg-flash {
          0% { opacity: 0; }
          20% { opacity: 0.45; }
          100% { opacity: 0; }
        }
        @keyframes combo-bounce {
          0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
          40% { transform: translateX(-50%) scale(1.2); opacity: 1; }
          70% { transform: translateX(-50%) scale(0.95); opacity: 1; }
          100% { transform: translateX(-50%) scale(1.0); opacity: 1; }
        }
        .merge-pop-modal {
          animation: merge-pop 1.8s ease-out forwards;
        }
        .bg-flash-overlay {
          animation: bg-flash 0.3s ease-out forwards;
        }
        .combo-anim {
          animation: combo-bounce 0.4s ease-out forwards;
        }
      `}</style>

      {/* ストリークバナー */}
      {streakState.showBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-6 py-3 rounded-2xl font-black text-white text-lg shadow-2xl animate-bounce"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f472b6)", boxShadow: "0 0 30px rgba(245,158,11,0.7)" }}>
            🔥 {streakState.streak}日連続プレイ！
          </div>
        </div>
      )}

      {/* デイリーチャレンジバー */}
      <div className="w-full max-w-[400px] px-3 pt-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-purple-400 font-bold">
            📅 今日のチャレンジ {dailyChallenge.cleared ? "✅ クリア！" : `目標: ${dailyChallenge.target.toLocaleString()}pt`}
          </span>
          <span className="text-[10px] text-yellow-400">{dailyChallengeProgress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(167,139,250,0.2)" }}>
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${dailyChallengeProgress}%`,
              background: dailyChallenge.cleared
                ? "linear-gradient(90deg, #34d399, #10b981)"
                : "linear-gradient(90deg, #a78bfa, #f472b6)",
            }} />
        </div>
      </div>

      {/* Header */}
      <div className="w-full max-w-[400px] px-3 pt-3 pb-1 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs text-purple-300">字玉 JITAMA</div>
          {jlptMode !== "all" && (
            <div className="text-[10px] font-bold text-emerald-400">
              {currentModeInfo.emoji} {currentModeInfo.label} MODE
            </div>
          )}
          {streakState.streak >= 2 && (
            <div className="text-[10px] font-bold text-amber-400">🔥 {streakState.streak}日連続</div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-[10px] text-purple-400">SCORE</div>
            <div className="text-lg font-bold text-yellow-300">{state.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-purple-400">BEST</div>
            <div className="text-lg font-bold text-purple-200">{state.highScore.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-purple-400">NEXT</div>
            <div
              className="text-xl font-bold"
              style={{ color: `#${nextKanji.color.toString(16).padStart(6, "0")}` }}
            >
              {nextKanji.char}
            </div>
            <div className="text-[9px] text-purple-500">{nextKanji.jlpt}</div>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div
        ref={containerRef}
        className="w-[400px] max-w-full"
        style={{ height: 620, position: "relative" }}
      />

      {/* JLPT進捗バー */}
      {!state.gameOver && (
        <div className="w-full max-w-[400px]">
          <JLPTProgressBar score={state.score} />
        </div>
      )}

      {/* ── コンボカウンター ─────────────────────────────────────────────── */}
      {showCombo && comboState.count >= 2 && !state.gameOver && (
        <div
          key={`combo-${comboState.lastMergeAt}`}
          className="combo-anim fixed z-30 pointer-events-none"
          style={{ top: "22%", left: "50%" }}
        >
          <div
            className="px-5 py-2 rounded-2xl font-black text-white text-xl shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${getComboColor(comboState.count)}, ${getComboColor(comboState.count)}88)`,
              boxShadow: `0 0 24px ${getComboColor(comboState.count)}88`,
              border: `2px solid ${getComboColor(comboState.count)}`,
              whiteSpace: "nowrap",
            }}
          >
            {comboState.count >= 4 ? "🔥" : comboState.count >= 3 ? "✨" : "⚡"}
            {" "}{comboState.count} COMBO!
          </div>
        </div>
      )}

      {/* ── 合体アニメ演出モーダル ───────────────────────────────────────── */}
      {mergeAnimation && !state.gameOver && (() => {
        const kl = KANJI_LEVELS[mergeAnimation.level];
        const kn = mergeAnimation.knowledge;
        const hexColor = `#${kl.color.toString(16).padStart(6, "0")}`;
        return (
          <div
            key={`merge-anim-${mergeAnimation.id}`}
            className="fixed inset-0 z-[25] pointer-events-none"
          >
            {/* 背景フラッシュ */}
            <div
              className="bg-flash-overlay absolute inset-0"
              style={{ background: `radial-gradient(circle, ${hexColor}44 0%, transparent 70%)` }}
            />
            {/* メインポップアップ */}
            <div
              className="merge-pop-modal absolute"
              style={{ top: "42%", left: "50%" }}
            >
              <div
                className="rounded-2xl px-6 py-4 text-center shadow-2xl"
                style={{
                  background: "rgba(26,10,46,0.96)",
                  border: `2px solid ${hexColor}`,
                  boxShadow: `0 0 40px ${hexColor}66`,
                  minWidth: "220px",
                }}
              >
                {/* 合体前後表示 */}
                {kn && (
                  <div className="text-sm text-purple-300 mb-1 font-bold">
                    {kn.before1} + {kn.before2} =
                  </div>
                )}
                {/* 合体した漢字（大） */}
                <div
                  className="text-6xl font-black mb-1"
                  style={{ color: hexColor, textShadow: `0 0 20px ${hexColor}` }}
                >
                  {kl.char}
                </div>
                {/* 「合体！」テキスト */}
                <div className="text-yellow-300 font-black text-lg mb-1">合体！</div>
                {/* 漢字名・読み */}
                <div className="text-white font-bold text-sm">
                  「{kl.char}」{kn ? `（${kn.reading}）` : `（${kl.reading}）`}
                </div>
                {/* 豆知識 */}
                {kn && (
                  <div className="text-purple-300 text-xs mt-1.5 leading-snug">
                    {kn.trivia}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* JLPT Study Hint — appears on merge in JLPT modes */}
      {state.mergeHint && !state.gameOver && (
        <div
          key={state.mergeHint.id}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in-up"
        >
          <div className="bg-black/80 backdrop-blur-sm border border-purple-500/60 rounded-xl px-5 py-3 text-center shadow-lg">
            <div className="text-3xl font-bold text-yellow-300 mb-1">{state.mergeHint.char}</div>
            <div className="text-sm text-purple-200 font-medium">{state.mergeHint.reading}</div>
            <div className="text-xs text-purple-400">{state.mergeHint.meaning}</div>
            <div className="text-[9px] text-purple-500 mt-1">JLPT {state.mergeHint.jlpt}</div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {state.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-y-auto py-4">
          <div className="bg-[#1a0a2e]/95 border border-purple-500 rounded-2xl p-6 text-center w-full max-w-sm mx-4">
            <p className="text-4xl font-bold text-white mb-1">GAME OVER</p>
            <p className="text-yellow-300 text-3xl font-black mb-1">{state.score.toLocaleString()} pt</p>
            {state.score >= state.highScore && state.score > 0 && (
              <p className="text-pink-400 text-sm font-bold mb-1 animate-pulse">NEW HIGH SCORE!</p>
            )}
            {/* ニアミス演出: 自己ベストの90%以上の場合 */}
            {state.score < state.highScore && state.prevHighScore > 0 && (state.highScore - state.score) <= state.highScore * 0.12 && (
              <p className="text-amber-400 text-xs font-bold mb-1 animate-pulse">
                惜しい！あと {(state.highScore - state.score).toLocaleString()} ptで自己ベスト更新！
              </p>
            )}
            {state.newRank !== null && (
              <p className="text-emerald-400 text-xs font-bold mb-1">
                ランキング {state.newRank}位に登録されました！
              </p>
            )}

            {/* ─── 段位表示ブロック ──────────────────────────────────── */}
            {(() => {
              const { currentRank, nextRank, required, progress } = getRankProgress(state.score);
              const isRankUp = state.showRankUpBanner;
              return (
                <div className="my-3 rounded-xl p-3 text-left" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  {isRankUp && (
                    <div className="text-center mb-2 py-1.5 rounded-lg font-black text-sm animate-pulse"
                      style={{ background: currentRank.gradient, color: currentRank.textColor }}>
                      🎊 段位アップ！
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{currentRank.icon}</span>
                    <div>
                      <div className="text-xs text-purple-400">現在の段位</div>
                      <div className="text-sm font-black" style={{ color: currentRank.textColor }}>
                        {currentRank.label}
                      </div>
                      <div className="text-[10px] text-purple-600">{currentRank.labelEn}</div>
                    </div>
                  </div>
                  {nextRank ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-purple-500">次の段位: {nextRank.icon} {nextRank.label}</span>
                        <span className="text-[10px] text-purple-400">あと {required.toLocaleString()} pt</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(167,139,250,0.2)" }}>
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${progress}%`, background: currentRank.gradient }} />
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-yellow-300 font-bold text-center mt-1">
                      👑 最高段位達成！あなたは字玉の頂点に立った！
                    </div>
                  )}
                </div>
              );
            })()}
            {/* ─────────────────────────────────────────────────────────── */}

            <p className="text-purple-300 text-xs mb-3">段位を上げて友達に自慢しよう！</p>

            {/* ─── ニックネーム入力 ──────────────────────────────────── */}
            {!state.nicknameSaved && (
              <div className="mb-4 rounded-xl p-3 text-left" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.3)" }}>
                <p className="text-xs font-bold text-purple-300 mb-2 text-center">📝 ランキングに名前を登録</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleNicknameSubmit(); }}
                    placeholder="ニックネームを入力"
                    maxLength={12}
                    className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(167,139,250,0.4)" }}
                  />
                  <button
                    onClick={handleNicknameSubmit}
                    className="px-4 py-2 rounded-lg font-bold text-sm text-[#1a0a2e] active:scale-95 transition-transform"
                    style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                  >
                    登録
                  </button>
                </div>
                <p className="text-[10px] text-purple-600 mt-1.5 text-center">空欄のまま登録すると「名無し」になります</p>
              </div>
            )}
            {/* ─────────────────────────────────────────────────────────── */}

            {/* もう一回ボタンを最上部・最大サイズで表示 */}
            <button
              onClick={handleRestart}
              className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-black text-xl py-4 rounded-2xl mb-3 shadow-lg shadow-pink-900/50 active:scale-95 transition-transform"
            >
              🀄 もう一回！
            </button>

            {/* ─── デイリーランキング（本日の上位） ──────────────────────── */}
            {(() => {
              const dailyRankings = getTopDailyRankings(10);
              if (dailyRankings.length === 0) return null;
              const today = new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
              return (
                <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.06)" }}>
                  <div className="px-3 py-2 text-xs font-black flex items-center gap-1" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                    🏆 {today} デイリーランキング TOP{Math.min(10, dailyRankings.length)}
                  </div>
                  {dailyRankings.map((r, i) => {
                    const isMe = state.nicknameSaved && r.score === state.score;
                    return (
                      <div key={`${r.time}-${i}`} className="flex items-center justify-between px-3 py-1.5 text-xs"
                        style={{
                          borderTop: i > 0 ? "1px solid rgba(167,139,250,0.1)" : "none",
                          background: isMe ? "rgba(244,114,182,0.1)" : "transparent",
                        }}>
                        <span className="font-black" style={{
                          color: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : i === 2 ? "#d97706" : "#a78bfa",
                        }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                        </span>
                        <span className="font-bold truncate max-w-[80px]" style={{ color: isMe ? "#f472b6" : "#e9d5ff" }}>
                          {isMe ? "★ " : ""}{r.nickname}
                        </span>
                        <span className="font-black" style={{ color: "#fbbf24" }}>{r.score.toLocaleString()} pt</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ─── デイリーチャレンジ結果カード ─────────────────────────── */}
            {(() => {
              const dc = getDailyChallengeStatus();
              const emojiGrid = buildDailyChallengeEmoji(dc.best, dc.target);
              const today = new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
              return (
                <div className="mb-3 rounded-xl p-3 text-center" style={{
                  background: dc.cleared ? "rgba(52,211,153,0.1)" : "rgba(167,139,250,0.08)",
                  border: dc.cleared ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(167,139,250,0.2)",
                }}>
                  <div className="text-xs font-bold mb-1" style={{ color: dc.cleared ? "#34d399" : "#a78bfa" }}>
                    📅 {today}のデイリーチャレンジ {dc.cleared ? "✅ クリア！" : `目標 ${dc.target.toLocaleString()}pt`}
                  </div>
                  <div className="text-xl tracking-widest my-1">{emojiGrid}</div>
                  <div className="text-xs text-purple-400">
                    {dc.cleared
                      ? `🎉 ${dc.best.toLocaleString()}pt 達成！みんなに自慢しよう`
                      : `${dc.best.toLocaleString()} / ${dc.target.toLocaleString()}pt — あと少し！`}
                  </div>
                </div>
              );
            })()}
            {/* ─────────────────────────────────────────────────────────── */}

            <button
              onClick={handleShare}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 rounded-xl mb-2 flex items-center justify-center gap-2 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              今日の記録をXでシェアする
            </button>
            {/* ─── 苦手漢字ミニクイズ ─────────────────────────────────── */}
            {(() => {
              const { knowledge, choices, level } = getWeakQuizItem(weakQuizIdx);
              const kl = KANJI_LEVELS[level];
              const hexColor = kl ? `#${kl.color.toString(16).padStart(6, "0")}` : "#a78bfa";
              const isAnswered = weakQuizAnswer !== null;
              return (
                <div className="mb-3 rounded-xl p-3 text-center" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.25)" }}>
                  <div className="text-xs font-bold text-purple-400 mb-2">📖 合体知識クイズ — 読みを当てよう！</div>
                  <div className="text-3xl font-black mb-1" style={{ color: hexColor }}>{knowledge.after}</div>
                  <div className="text-xs text-purple-500 mb-2">{knowledge.before1} + {knowledge.before2} = ?</div>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {choices.map(choice => {
                      let bg = "rgba(167,139,250,0.1)";
                      let border = "rgba(167,139,250,0.3)";
                      let color = "#e9d5ff";
                      if (isAnswered) {
                        if (choice === knowledge.reading) { bg = "rgba(52,211,153,0.2)"; border = "#34d399"; color = "#86efac"; }
                        else if (choice === weakQuizAnswer) { bg = "rgba(239,68,68,0.2)"; border = "#ef4444"; color = "#fca5a5"; }
                        else { bg = "rgba(100,100,100,0.1)"; border = "transparent"; color = "rgba(167,139,250,0.3)"; }
                      }
                      return (
                        <button key={choice}
                          onClick={() => !isAnswered && setWeakQuizAnswer(choice)}
                          disabled={isAnswered}
                          className="py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                          style={{ background: bg, border: `1px solid ${border}`, color }}>
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                  {isAnswered && (
                    <div className="text-xs mb-2" style={{ color: "rgba(167,139,250,0.7)" }}>
                      {knowledge.trivia}
                    </div>
                  )}
                  {isAnswered && (
                    <button
                      onClick={() => { setWeakQuizIdx(i => i + 1); setWeakQuizAnswer(null); }}
                      className="text-xs px-4 py-1.5 rounded-full font-bold"
                      style={{ background: "rgba(167,139,250,0.2)", color: "#c084fc", border: "1px solid rgba(167,139,250,0.4)" }}>
                      次の問題 →
                    </button>
                  )}
                </div>
              );
            })()}
            {/* 広告表示エリア（AdSense申請後に有効化） */}
            <div id="ad-container" className="w-full min-h-[60px] my-2 flex items-center justify-center">
              {/* Google AdSense広告がここに表示されます */}
            </div>

            {/* ローカルランキング */}
            <LocalRanking
              entries={state.ranking}
              newRank={state.newRank}
              onReset={() => {
                resetRanking();
                setState((prev) => ({ ...prev, ranking: [], newRank: null }));
              }}
            />
          </div>
        </div>
      )}

      {/* 初回チュートリアルオーバーレイ */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-end justify-center pb-8 px-4"
          style={{ backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm bg-[#1a0a2e] border border-purple-500 rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{tutorialSteps[tutorialStep].icon}</div>
              <h2 className="text-xl font-black text-yellow-300 mb-1">
                {tutorialSteps[tutorialStep].title}
              </h2>
              <p className="text-purple-200 text-sm">{tutorialSteps[tutorialStep].desc}</p>
            </div>
            {/* ステップインジケーター */}
            <div className="flex justify-center gap-2 mb-5">
              {tutorialSteps.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === tutorialStep ? "#fbbf24" : "rgba(167,139,250,0.4)" }} />
              ))}
            </div>
            {/* Arrow overlay hint */}
            {tutorialStep === 0 && (
              <div className="flex items-center justify-center mb-4">
                <div className="text-5xl animate-bounce text-yellow-300">👆</div>
                <div className="ml-3 text-purple-300 text-sm font-bold">↑ ここをタップ！</div>
              </div>
            )}
            <div className="flex gap-3">
              {tutorialStep > 0 && (
                <button onClick={() => setTutorialStep(s => s - 1)}
                  className="flex-1 py-2 rounded-xl text-sm text-purple-400 border border-purple-700">
                  ← 戻る
                </button>
              )}
              <button
                onClick={() => {
                  if (tutorialStep < tutorialSteps.length - 1) {
                    setTutorialStep(s => s + 1);
                  } else {
                    localStorage.setItem("jitama_tutorial_seen", "1");
                    setShowTutorial(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl font-black text-[#1a0a2e] transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
              >
                {tutorialStep < tutorialSteps.length - 1 ? "次へ →" : "さあ遊ぼう！🀄"}
              </button>
            </div>
            <button onClick={() => { localStorage.setItem("jitama_tutorial_seen", "1"); setShowTutorial(false); }}
              className="w-full mt-2 text-xs text-purple-600 hover:text-purple-400">
              スキップ
            </button>
          </div>
        </div>
      )}

      {/* 「字」到達 花火セレブレーション */}
      {showJiCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          style={{ backdropFilter: "blur(4px)" }}>
          <style>{`
            @keyframes ji-firework-1 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-100px,-150px);opacity:0} }
            @keyframes ji-firework-2 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(110px,-140px);opacity:0} }
            @keyframes ji-firework-3 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-60px,-190px);opacity:0} }
            @keyframes ji-firework-4 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(80px,-180px);opacity:0} }
            @keyframes ji-firework-5 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-130px,-80px);opacity:0} }
            @keyframes ji-firework-6 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(140px,-70px);opacity:0} }
            .ji-p { position:absolute; width:12px; height:12px; border-radius:50%; }
            .ji-p1 { background:#f472b6; animation:ji-firework-1 1.0s ease-out infinite; }
            .ji-p2 { background:#fbbf24; animation:ji-firework-2 1.1s ease-out infinite 0.1s; }
            .ji-p3 { background:#a78bfa; animation:ji-firework-3 1.2s ease-out infinite 0.2s; }
            .ji-p4 { background:#34d399; animation:ji-firework-4 1.0s ease-out infinite 0.15s; }
            .ji-p5 { background:#60a5fa; animation:ji-firework-5 1.3s ease-out infinite 0.05s; }
            .ji-p6 { background:#fb923c; animation:ji-firework-6 1.1s ease-out infinite 0.25s; }
          `}</style>
          <div className="relative rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #1a0a2e, #2d1b69)",
              border: "2px solid rgba(244,114,182,0.6)",
              boxShadow: "0 0 60px rgba(244,114,182,0.4)",
            }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
              <div className="relative">
                <div className="ji-p ji-p1" /><div className="ji-p ji-p2" />
                <div className="ji-p ji-p3" /><div className="ji-p ji-p4" />
                <div className="ji-p ji-p5" /><div className="ji-p ji-p6" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-7xl font-black mb-2" style={{ color: "#f472b6", textShadow: "0 0 30px rgba(244,114,182,0.9)" }}>字</div>
              <h2 className="text-2xl font-black mb-1 text-yellow-300">最大漢字に到達！</h2>
              <p className="text-purple-200 text-sm mb-1 font-bold">字玉マスター達成！🀄</p>
              <p className="text-purple-400 text-xs mb-4">「一」から「字」まで全てコンプリート！</p>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎉 字玉JITAMAで最大漢字「字」に到達しました！スコア${state.score}点！漢字合体パズルの最高到達点です🀄 → https://jitama.vercel.app #字玉 #JITAMA #漢字ゲーム`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm mb-3 transition-all active:scale-95"
                style={{ background: "#000" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                達成をXで自慢する 🎊
              </a>
              <button onClick={() => setShowJiCelebration(false)}
                className="w-full py-2 rounded-xl font-bold text-[#1a0a2e] text-sm active:scale-95"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
                ゲームを続ける →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="w-full max-w-[400px] px-3 py-2">
        <div className="text-[10px] text-purple-400 mb-1">合体チャート（小→大）</div>
        <div className="flex gap-1 flex-wrap">
          {KANJI_LEVELS.map((kl) => (
            <div key={kl.level} className="text-center">
              <div
                className="text-xs font-bold"
                style={{ color: `#${kl.color.toString(16).padStart(6, "0")}` }}
              >
                {kl.char}
              </div>
              <div className="text-[8px] text-purple-600">{kl.jlpt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
