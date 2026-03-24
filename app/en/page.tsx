import Link from "next/link";
import Image from "next/image";
import { KANJI_LEVELS } from "@/lib/kanji-data";

export const metadata = {
  title: "Kanji Merge Game — Learn JLPT Kanji While Playing | JITAMA",
  description:
    "Merge kanji to learn Japanese! The only game that teaches JLPT N5-N1 vocabulary through fun physics puzzle gameplay. Free to play in your browser.",
};

export default function EnLandingPage() {
  return (
    <main className="min-h-screen bg-[#1a0a2e] text-white">
      {/* Hero */}
      <section className="max-w-lg mx-auto px-4 pt-10 pb-10 text-center">
        <Image
          src="/images/mascot.png"
          alt="JITAMA mascot"
          width={120}
          height={120}
          className="mx-auto mb-4"
          priority
        />
        <div className="text-7xl font-bold mb-2 tracking-tight">
          <span className="text-yellow-300">字</span>
          <span className="text-pink-400">玉</span>
        </div>
        <div className="text-xl text-purple-300 font-light mb-6 tracking-widest">JITAMA</div>
        <h1 className="text-2xl font-bold mb-4 leading-tight">
          Merge Kanji to{" "}
          <span className="text-yellow-300">Learn Japanese</span>
        </h1>
        <p className="text-purple-200 text-sm mb-3 leading-relaxed">
          The only game that teaches{" "}
          <span className="text-pink-400 font-semibold">JLPT vocabulary</span>{" "}
          while you play
        </p>
        <p className="text-purple-300 text-xs mb-8 leading-relaxed">
          Drop kanji tiles — same characters merge and evolve into higher-level kanji.
          Learn readings &amp; meanings as you play the physics puzzle.
        </p>

        <Link
          href="/game"
          className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
        >
          Play Free Now
        </Link>
        <p className="text-xs text-purple-400 mt-3">No install needed · Play in your browser</p>

        {/* Hero banner */}
        <div className="mt-8 rounded-2xl overflow-hidden shadow-lg shadow-purple-900/50">
          <Image
            src="/images/hero.png"
            alt="JITAMA kanji merge game screenshot"
            width={640}
            height={360}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-center text-lg font-bold mb-6">Why JITAMA?</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: "",
              title: "Physics Puzzle",
              desc: "Addictive Suika-style gameplay — drop and merge kanji tiles",
            },
            {
              icon: "",
              title: "JLPT N5 ~ N1",
              desc: "Kanji from all JLPT levels. Learn readings & meanings on every merge",
            },
            {
              icon: "",
              title: "Play in Browser",
              desc: "No app download required. Works on any device instantly",
            },
            {
              icon: "",
              title: "Share Scores on X",
              desc: "Post your high score to X and challenge your friends",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 rounded-xl p-4 text-center border border-purple-800"
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="font-bold text-sm mb-1">{f.title}</p>
              <p className="text-xs text-purple-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kanji progression */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-center text-sm text-purple-400 mb-4 tracking-wider">
          MERGE CHART — evolve from 一 to 字
        </h2>
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
        <h2 className="text-center text-lg font-bold mb-6">How to Play</h2>
        <div className="flex justify-center mb-6">
          <Image
            src="/images/merge_effect.png"
            alt="Kanji merge animation"
            width={160}
            height={160}
            className="rounded-2xl shadow-lg shadow-yellow-900/30"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "", title: "Tap to Drop", desc: "Tap anywhere to drop a kanji tile into the field" },
            { icon: "", title: "Same = Merge", desc: "Matching kanji touch and combine into a higher-level character" },
            { icon: "", title: "Aim for 字!", desc: "Higher kanji score more points. Can you reach 字?" },
          ].map((s) => (
            <div key={s.title} className="bg-white/5 rounded-xl p-4 text-center border border-purple-800">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="font-bold text-sm mb-1">{s.title}</p>
              <p className="text-xs text-purple-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JLPT Mode Section */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-700/60 rounded-2xl p-6">
          <div className="text-center mb-5">
            <div className="flex justify-center gap-3 mb-3">
              <Image src="/images/jlpt_n5_badge.png" alt="JLPT N5" width={48} height={48} />
              <Image src="/images/jlpt_n1_badge.png" alt="JLPT N1" width={48} height={48} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Learn Kanji with JLPT Mode</h2>
            <p className="text-emerald-300 text-sm font-medium">
              Study as you play — readings &amp; meanings on every merge
            </p>
            <p className="text-emerald-200/80 text-xs mt-1">
              Covering all levels from beginner N5 to advanced N1
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "N5", emoji: "", label: "JLPT N5", sub: "Beginner · Free", premium: false },
              { key: "N4", emoji: "", label: "JLPT N4", sub: "Elementary", premium: true },
              { key: "N3", emoji: "", label: "JLPT N3~N2", sub: "Intermediate", premium: true },
              { key: "N1", emoji: "", label: "JLPT N1", sub: "Advanced", premium: true },
            ].map((mode) => (
              <Link
                key={mode.key}
                href={`/game?mode=${mode.key === "N3" ? "N3_N1" : mode.key}`}
                className={`relative border rounded-xl px-4 py-3 text-center transition-all hover:scale-[1.02] block ${
                  mode.premium
                    ? "bg-amber-900/20 hover:bg-amber-900/30 border-amber-700/60 hover:border-amber-500"
                    : "bg-white/5 hover:bg-white/10 border-emerald-800/60 hover:border-emerald-600"
                }`}
              >
                {mode.premium && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                     Premium
                  </span>
                )}
                {!mode.premium && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    Free
                  </span>
                )}
                <div className="text-2xl mb-1">{mode.emoji}</div>
                <div className="text-sm font-bold text-white">{mode.label}</div>
                <div className="text-[10px] text-emerald-400">{mode.sub}</div>
              </Link>
            ))}
          </div>
          <div className="mt-4 bg-white/5 border border-emerald-800/40 rounded-xl px-4 py-3">
            <p className="text-xs text-emerald-300 font-medium text-center mb-1">
              How JLPT Mode works
            </p>
            <p className="text-[11px] text-emerald-200/70 text-center">
              Every time two kanji merge, their reading (hiragana/romaji) and
              English meaning pop up — helping you memorize naturally while playing.
            </p>
          </div>
          <p className="text-center text-[10px] text-emerald-600 mt-3">
            N5 Free · N4~N1 Premium ¥480/month · No install needed
          </p>
        </div>
      </section>

      {/* Social sharing */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <h2 className="text-sm text-purple-400 mb-4">Share Your Score on X</h2>
        <div className="bg-white/5 border border-purple-800 rounded-2xl p-6">
          <p className="text-lg font-bold text-yellow-300 mb-2">"JITAMA score: 1,234!"</p>
          <p className="text-sm text-purple-200 mb-4">
            One tap to post your score after every game.
            <br />
            Challenge your friends to beat it.
          </p>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              "JITAMA — Merge kanji to learn Japanese! Physics puzzle meets JLPT study  → https://jitama.vercel.app/en #JITAMA #LearnJapanese #JLPT"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: "#000" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share JITAMA on X
          </a>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <Link
          href="/game"
          className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
        >
          Play Free Now →
        </Link>
        <p className="text-xs text-purple-400 mt-3">No sign-up required</p>
      </section>

      {/* Premium Section */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-700 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3"></div>
          <h2 className="text-xl font-bold text-white mb-2">Unlock All JLPT Levels</h2>
          <p className="text-purple-300 text-sm mb-4">
            Unlimited play + JLPT N4 ~ N1 kanji packs
          </p>
          <p className="text-4xl font-black text-white mb-1">
            ¥480
            <span className="text-base font-normal text-purple-400">/month</span>
          </p>
          <ul className="text-sm text-purple-200 space-y-1 mb-6 text-left">
            <li> Unlimited plays — no daily limit</li>
            <li> JLPT N4 kanji pack unlocked </li>
            <li> JLPT N3 ~ N1 advanced kanji pack </li>
            <li> Support JITAMA development</li>
          </ul>
          <Link
            href="/game"
            className="inline-block w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-base px-8 py-3 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
          >
            Start Free · Upgrade Anytime
          </Link>
          <p className="text-xs text-purple-500 mt-3">
            Cancel anytime · Secure payment
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-xs text-purple-400 mb-2">
          <Link href="/" className="underline hover:text-purple-200">
            日本語版はこちら
          </Link>
        </p>
        <p className="text-xs text-purple-500">
          © 2026 字玉 JITAMA |{" "}
          <Link href="/legal" className="underline hover:text-purple-300">
            Legal
          </Link>
          {" "}·{" "}
          <Link href="/privacy" className="underline hover:text-purple-300">
            Privacy
          </Link>
        </p>
      </section>
    </main>
  );
}
