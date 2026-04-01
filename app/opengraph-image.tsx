import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "字玉 JITAMA — 漢字マージパズル | 部首を落として合体！";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #1a0a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <svg viewBox="0 0 80 80" width={80} height={80}>
            <rect x="10" y="10" width="60" height="60" rx="8" fill="rgba(167,139,250,0.2)" stroke="rgba(167,139,250,0.5)" strokeWidth="2" />
            <text x="40" y="58" textAnchor="middle" fontSize="48" fontWeight="700" fill="#fbbf24" fontFamily="sans-serif">字</text>
          </svg>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#fbbf24", marginBottom: 8, textAlign: "center" }}>
          字玉 JITAMA
        </div>
        <div style={{ fontSize: 30, color: "#c4b5fd", marginBottom: 12, textAlign: "center" }}>
          漢字マージパズル
        </div>
        <div style={{ fontSize: 24, color: "#e2e8f0", textAlign: "center", maxWidth: 900 }}>
          部首を落として合体させよう！スイカゲーム式 × 漢字
        </div>
        <div style={{ fontSize: 22, color: "#a78bfa", marginTop: 10, textAlign: "center" }}>
          JLPT N5〜N1 対応 · 全年齢 · 無料でプレイ 
        </div>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
          }}
        >
          {["木 + 木 = 林", "林 + 木 = 森", "森 + ？ = "].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                background: "rgba(167,139,250,0.2)",
                border: "1px solid rgba(167,139,250,0.5)",
                borderRadius: 24,
                fontSize: 18,
                color: "#c4b5fd",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
