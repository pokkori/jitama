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

interface MergeHint {
  char: string;
  reading: string;
  meaning: string;
  jlpt: string;
  id: number;
}

interface GameState {
  score: number;
  nextLevel: number;
  gameOver: boolean;
  highScore: number;
  mergeHint: MergeHint | null;
  ranking: RankingEntry[];
  newRank: number | null; // 今回の順位（null = ランク外 or まだゲーム中）
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

// ─── React Component ──────────────────────────────────────────────────────────

export default function KanjiGame({ onGameOver: onGameOverExternal, jlptMode = "all" }: KanjiGameProps = {}) {
  const currentModeInfo = JLPT_MODES.find((m) => m.key === jlptMode) ?? JLPT_MODES[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { playMerge, playGameOver, playHighScore } = useGameSounds();
  const hintIdRef = useRef(0);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<GameState>({
    score: 0,
    nextLevel: 0,
    gameOver: false,
    highScore: 0,
    mergeHint: null,
    ranking: [],
    newRank: null,
  });

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
          if (score >= newHs) playHighScore();
          else playGameOver();

          // ── ランキング保存 ──────────────────────────────────────────────
          const entry: RankingEntry = {
            score,
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
          // ───────────────────────────────────────────────────────────────

          setState((prev) => ({
            ...prev,
            gameOver: true,
            highScore: newHs,
            ranking: updatedRanking,
            newRank: rank,
          }));
          onGameOverExternal?.(score);
        },
        (level) => {
          playMerge(level);
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
      setState((prev) => ({ ...prev, highScore: hs, ranking: savedRanking }));
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
    setState({ score: 0, nextLevel: 0, gameOver: false, highScore: state.highScore, mergeHint: null, ranking: loadRanking(), newRank: null });
    // Re-mount triggers useEffect
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleShare = () => {
    const isHighScore = state.score >= state.highScore && state.score > 0;
    const scoreRank = state.score >= 5000 ? "上級者レベル！" : state.score >= 2000 ? "中級者レベル！" : "入門者レベル！";
    const text = isHighScore
      ? `【NEW記録🎉】字玉JITAMAで${state.score}点を達成！${scoreRank} あなたは何点取れる？友達と競おう！🀄 #字玉 #JITAMA #漢字ゲーム`
      : `字玉JITAMAで${state.score}点！${scoreRank} あなたのスコアは何位？友達と競おう！🀄 #字玉 #JITAMA #漢字ゲーム`;
    const url = `https://jitama.vercel.app/share/${state.score}`;
    if (navigator.share) {
      navigator.share({ title: "字玉 JITAMA", text, url });
    } else {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      );
    }
  };

  const nextKanji = KANJI_LEVELS[state.nextLevel];

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1a0a2e] select-none">
      {/* Header */}
      <div className="w-full max-w-[400px] px-3 pt-3 pb-1 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs text-purple-300">字玉 JITAMA</div>
          {jlptMode !== "all" && (
            <div className="text-[10px] font-bold text-emerald-400">
              {currentModeInfo.emoji} {currentModeInfo.label} MODE
            </div>
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
            <p className="text-yellow-300 text-2xl font-bold mb-1">{state.score.toLocaleString()} pt</p>
            {state.score >= state.highScore && state.score > 0 && (
              <p className="text-pink-400 text-sm font-bold mb-1">🎉 NEW HIGH SCORE!</p>
            )}
            {state.newRank !== null && (
              <p className="text-emerald-400 text-xs font-bold mb-1">
                ランキング {state.newRank}位に登録されました！
              </p>
            )}
            <p className="text-purple-300 text-xs mb-3">あなたのスコアは何位？友達と競おう！</p>
            <button
              onClick={handleShare}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl mb-2"
            >
              スコアをXでシェア 🐦
            </button>
            {/* 広告表示エリア（AdSense申請後に有効化） */}
            <div id="ad-container" className="w-full min-h-[60px] my-2 flex items-center justify-center">
              {/* Google AdSense広告がここに表示されます */}
            </div>
            <button
              onClick={handleRestart}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mb-4"
            >
              もう一回遊ぶ
            </button>

            {/* ローカルランキング */}
            <LocalRanking
              entries={state.ranking}
              onReset={() => {
                resetRanking();
                setState((prev) => ({ ...prev, ranking: [], newRank: null }));
              }}
            />
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
