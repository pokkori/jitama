import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "字玉 JITAMA — スコア結果";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getRank(score: number): { label: string; color: string } {
  if (score >= 10000) return { label: "漢字の神様！", color: "#ff6b6b" };
  if (score >= 5000) return { label: "上級者レベル！", color: "#ffd700" };
  if (score >= 2000) return { label: "中級者レベル！", color: "#4ecdc4" };
  return { label: "入門者レベル！", color: "#c4b5fd" };
}

export default async function Image({
  params,
}: {
  params: { score: string };
}) {
  const score = parseInt(params.score ?? "0", 10);
  const rank = getRank(score);

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #0f0a1e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 背景デコ */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 400,
            opacity: 0.05,
          }}
        >
          🀄
        </div>

        {/* タイトル */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#a78bfa",
            marginBottom: 8,
            letterSpacing: 4,
          }}
        >
          字玉 JITAMA
        </div>

        {/* GAME OVER */}
        <div
          style={{
            fontSize: 28,
            color: "#e2e8f0",
            marginBottom: 16,
            opacity: 0.7,
          }}
        >
          GAME OVER
        </div>

        {/* スコア */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: "#fbbf24",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {score.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#fbbf24",
            marginBottom: 24,
            opacity: 0.8,
          }}
        >
          pt
        </div>

        {/* ランク */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: rank.color,
            marginBottom: 32,
          }}
        >
          {rank.label}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(167,139,250,0.2)",
            border: "2px solid rgba(167,139,250,0.5)",
            borderRadius: 48,
            padding: "12px 32px",
          }}
        >
          <div style={{ fontSize: 28, color: "#c4b5fd" }}>
            あなたは何点取れる？
          </div>
          <div style={{ fontSize: 24, color: "#a78bfa" }}>
            jitama.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
