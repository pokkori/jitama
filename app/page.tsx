import Link from "next/link";
import { KANJI_LEVELS } from "@/lib/kanji-data";

const LEVELS_PREVIEW = KANJI_LEVELS.slice(0, 6);

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#1a0a2e] text-white">
      {/* Hero */}
      <section className="max-w-lg mx-auto px-4 pt-16 pb-10 text-center">
        <div className="text-7xl font-bold mb-2 tracking-tight">
          <span className="text-yellow-300">字</span>
          <span className="text-pink-400">玉</span>
        </div>
        <div className="text-xl text-purple-300 font-light mb-6 tracking-widest">JITAMA</div>
        <h1 className="text-2xl font-bold mb-4 leading-tight">
          漢字が落ちて、<span className="text-yellow-300">合体</span>して、<br />
          どんどん<span className="text-pink-400">大きくなる。</span>
        </h1>
        <p className="text-purple-200 text-sm mb-8 leading-relaxed">
          「一」から「字」まで — 同じ漢字が触れると合体して進化する<br />
          物理パズルゲーム。スイカゲームの漢字版。
        </p>

        <Link
          href="/game"
          className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
        >
          今すぐ遊ぶ（無料）
        </Link>
        <p className="text-xs text-purple-400 mt-3">インストール不要・ブラウザで遊べる</p>
      </section>

      {/* Kanji progression */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-center text-sm text-purple-400 mb-4 tracking-wider">MERGE CHART — 合体チャート</h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {KANJI_LEVELS.map((kl, i) => (
            <div key={kl.level} className="flex items-center gap-1">
              <div className="text-center">
                <div
                  className="font-bold text-2xl"
                  style={{ color: `#${kl.color.toString(16).padStart(6, "0")}` }}
                >
                  {kl.char}
                </div>
                <div className="text-[9px] text-purple-400">{kl.jlpt}</div>
              </div>
              {i < KANJI_LEVELS.length - 1 && (
                <span className="text-purple-600 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How to play */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-center text-lg font-bold mb-6">遊び方</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "👆", title: "タップで落とす", desc: "好きな位置をタップして漢字を落とす" },
            { icon: "✨", title: "同じ字が合体", desc: "同じ漢字が触れると合体して進化する" },
            { icon: "🏆", title: "高得点を狙え", desc: "大きい漢字ほどハイスコア。「字」を出せ！" },
          ].map((s) => (
            <div key={s.title} className="bg-white/5 rounded-xl p-4 text-center border border-purple-800">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="font-bold text-sm mb-1">{s.title}</p>
              <p className="text-xs text-purple-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SNS / Social proof */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <h2 className="text-sm text-purple-400 mb-4">SNSでスコアをシェア</h2>
        <div className="bg-white/5 border border-purple-800 rounded-2xl p-6">
          <p className="text-lg font-bold text-yellow-300 mb-2">
            「字玉で1,234点！」
          </p>
          <p className="text-sm text-purple-200">
            ゲームオーバー後にワンタップでXに投稿できます。<br />
            友達と最高スコアを競おう。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <Link
          href="/game"
          className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
        >
          無料でプレイ →
        </Link>
        <p className="text-xs text-purple-500 mt-4">
          © 2026 字玉 JITAMA |{" "}
          <Link href="/legal" className="underline hover:text-purple-300">特商法</Link>
          {" "}·{" "}
          <Link href="/privacy" className="underline hover:text-purple-300">プライバシー</Link>
        </p>
      </section>
    </main>
  );
}
