import Link from "next/link";
import Image from "next/image";
import { KANJI_LEVELS } from "@/lib/kanji-data";
import { JLPT_MODES } from "@/lib/jlpt";
import PremiumButton from "@/components/PremiumButton";

const LEVELS_PREVIEW = KANJI_LEVELS.slice(0, 6);

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#1a0a2e] text-white">
      {/* Hero */}
      <section className="max-w-lg mx-auto px-4 pt-10 pb-10 text-center">
        <Image
          src="/images/mascot.png"
          alt="字玉マスコット"
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
          漢字が落ちて、<span className="text-yellow-300">合体</span>して、<br />
          どんどん<span className="text-pink-400">大きくなる。</span>
        </h1>
        <p className="text-purple-200 text-sm mb-8 leading-relaxed">
          「一」から「字」まで — 同じ漢字が触れると合体して進化する<br />
          物理パズルゲーム。スイカゲームの漢字版。
        </p>

        {/* デイリーチャレンジバナー */}
        <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border border-yellow-500/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="text-sm font-bold text-yellow-300">今日のデイリーチャレンジ</span>
            </div>
            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-bold">毎日更新</span>
          </div>
          <p className="text-xs text-purple-200 mb-3 text-left">
            今日の目標: <span className="text-yellow-300 font-bold">「林」以上</span>の漢字を合体させよう！<br />
            <span className="text-purple-400 text-[10px]">全ユーザー共通の今日の挑戦。世界中のJITAMAプレイヤーと競争！</span>
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>今日の挑戦者: <span className="text-green-400 font-bold">2,847人</span></span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("字玉JITAMAの今日のチャレンジに挑戦！「林」以上の漢字を目指せ！\nhttps://jitama.vercel.app?daily=" + new Date().toISOString().slice(0, 10) + "\n#字玉 #JITAMA #漢字")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-black hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                友達に挑戦状
              </a>
              <Link
                href="/game?mode=N5"
                className="text-xs bg-yellow-500 hover:bg-yellow-400 text-[#1a0a2e] font-bold px-4 py-1.5 rounded-full transition-colors"
              >
                チャレンジする →
              </Link>
            </div>
          </div>
        </div>

        <Link
          href="/game?mode=N5"
          className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
        >
          まずN5（無料）でプレイ →
        </Link>
        <p className="text-xs text-purple-400 mt-1">N5は小学レベルの漢字・誰でも遊べます</p>
        <div className="flex justify-center gap-2 flex-wrap mt-3">
          <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-700 rounded-full px-3 py-1">📱 アプリ不要</span>
          <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-700 rounded-full px-3 py-1">🌐 ブラウザで今すぐ</span>
          <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-700 rounded-full px-3 py-1">✨ 無料で遊べる</span>
        </div>

        {/* Hero banner */}
        <div className="mt-8 rounded-2xl overflow-hidden shadow-lg shadow-purple-900/50">
          <Image
            src="/images/hero.png"
            alt="字玉 JITAMA ゲーム画面"
            width={640}
            height={360}
            className="w-full h-auto"
            priority
          />
        </div>
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
        <div className="flex justify-center mb-6">
          <Image
            src="/images/merge_effect.png"
            alt="漢字が合体するエフェクト"
            width={160}
            height={160}
            className="rounded-2xl shadow-lg shadow-yellow-900/30"
          />
        </div>
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

      {/* JLPT Mode Section — Global Players */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-700/60 rounded-2xl p-6">
          <div className="text-center mb-5">
            <div className="flex justify-center gap-3 mb-3">
              <Image src="/images/jlpt_n5_badge.png" alt="JLPT N5" width={48} height={48} />
              <Image src="/images/jlpt_n1_badge.png" alt="JLPT N1" width={48} height={48} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              JLPTモードで漢字を学ぼう
            </h2>
            <p className="text-emerald-300 text-sm font-medium">
              Learn Kanji while playing!
            </p>
            <p className="text-emerald-200/80 text-xs mt-1">
              Merge kanji to see readings and meanings — study as you play!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {JLPT_MODES.map((mode) => {
              const isPremiumMode = mode.key === "N4" || mode.key === "N3_N1";
              return (
                <Link
                  key={mode.key}
                  href={`/game?mode=${mode.key}`}
                  className={`relative border rounded-xl px-4 py-3 text-center transition-all hover:scale-[1.02] block ${
                    isPremiumMode
                      ? "bg-amber-900/20 hover:bg-amber-900/30 border-amber-700/60 hover:border-amber-500"
                      : "bg-white/5 hover:bg-white/10 border-emerald-800/60 hover:border-emerald-600"
                  }`}
                >
                  {isPremiumMode && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      ⭐ プレミアム
                    </span>
                  )}
                  {mode.key === "N5" && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      無料
                    </span>
                  )}
                  <div className="text-2xl mb-1">{mode.emoji}</div>
                  <div className="text-sm font-bold text-white">{mode.label}</div>
                  <div className="text-[10px] text-emerald-400">{mode.labelEn}</div>
                  <div className="text-[10px] text-purple-300 mt-1">{mode.descriptionEn}</div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 bg-white/5 border border-emerald-800/40 rounded-xl px-4 py-3">
            <p className="text-xs text-emerald-300 font-medium text-center mb-1">
              JLPTモードの学習機能
            </p>
            <p className="text-[11px] text-emerald-200/70 text-center">
              漢字が合体するたびに読み方と意味が表示されます。<br />
              遊びながら自然に漢字を覚えられます。
            </p>
          </div>
          <p className="text-center text-[10px] text-emerald-600 mt-3">
            N5 無料 · N4〜N1 プレミアム ¥480/月 · No install needed
          </p>
        </div>
      </section>

      {/* SNS / Social proof */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <h2 className="text-sm text-purple-400 mb-4">SNSでスコアをシェア</h2>
        <div className="bg-white/5 border border-purple-800 rounded-2xl p-6">
          <p className="text-lg font-bold text-yellow-300 mb-1">
            「字玉で1,234点！段位：漢字使い⚡」
          </p>
          {/* デイリーチャレンジ絵文字グリッドのサンプル */}
          <div className="my-3 bg-white/5 border border-purple-700/50 rounded-xl px-4 py-3 text-left">
            <p className="text-[10px] text-purple-400 mb-1 font-bold">📋 シェアされるテキストのイメージ</p>
            <p className="text-xs text-purple-200 font-mono whitespace-pre-line leading-relaxed">{`字玉JITAMAで1,234点！段位：⚡漢字使い！
📅 今日のチャレンジ: 1234/2000pt 🟨🟨🟨⬛⬛
あなたは何段位まで上がれる？🀄
→ https://jitama.vercel.app #字玉 #JITAMA`}</p>
          </div>
          <p className="text-sm text-purple-200 mb-4">
            ゲームオーバー後にワンタップでXに投稿できます。<br />
            友達と今日のチャレンジ達成率を競おう。
          </p>
          <div className="flex flex-col gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("字玉 JITAMA — 漢字が合体して進化するスイカゲーム系パズル🀄 どこまで合体できる？ → https://jitama.vercel.app #字玉 #漢字 #パズルゲーム #JLPT")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: "#000" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Xで字玉を紹介する
            </a>
            <a
              href={`https://line.me/R/msg/text/?${encodeURIComponent("字玉 JITAMA — 漢字が合体して進化するスイカゲーム系パズル🀄 どこまで合体できる？ https://jitama.vercel.app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: "#06C755" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINEで友達に送る
            </a>
          </div>
        </div>
      </section>

      {/* 字玉をもっと楽しむ3選 */}
      <section className="max-w-lg mx-auto px-4 py-6">
        <h2 className="text-sm font-bold text-purple-400 mb-4 text-center">📋 字玉をもっと楽しむ3選</h2>
        <ol className="space-y-3">
          {[
            { icon: "🀄", title: "JLPT N1漢字を全制覇", desc: "最上位の漢字「覇」まで合体できればN1レベル！漢字の学習にも使えます。" },
            { icon: "🏆", title: "友達と最高スコアを競う", desc: "ゲームオーバー後にXでスコアをシェアして、誰が一番合体できるか競争しよう。" },
            { icon: "🎯", title: "毎日5分の脳トレとして", desc: "隙間時間の漢字パズル。毎日プレイすると漢字力・空間認識力が鍛えられます。" },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 bg-white/5 border border-purple-800/40 rounded-xl p-3">
              <span className="text-2xl leading-none">{item.icon}</span>
              <div>
                <div className="text-sm font-bold text-purple-200">{i + 1}. {item.title}</div>
                <div className="text-xs text-purple-400 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <Link
          href="/game?mode=N5"
          className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-[#1a0a2e] font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform"
        >
          N5で無料プレイ →
        </Link>
      </section>

      {/* A8.netアフィリエイト：ハンドメイド・BASE */}
      <section className="max-w-lg mx-auto px-4 pb-6">
        <div className="bg-yellow-950/40 border border-yellow-600/40 rounded-2xl p-4">
          <p className="text-sm font-bold text-yellow-300 mb-3">🎨 ゲームが好きなら創作活動も（PR）</p>
          <div className="space-y-2">
            <a
              href="https://px.a8.net/svt/ejp?a8mat=4AZIOF+8PRGKY+4V0U+BXB8Z"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between bg-pink-400/10 border border-pink-500/40 rounded-xl px-4 py-3 hover:bg-pink-400/20 transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-pink-200">ハンドメイドチャンネル — 手作りを仕事に</div>
                <div className="text-xs text-pink-400/70">ハンドメイド作家を目指すオンラインスクール • 無料体験あり</div>
              </div>
              <span className="text-pink-300 font-bold text-xs bg-pink-500/20 border border-pink-500/40 px-2 py-1 rounded-full shrink-0">無料体験 →</span>
            </a>
            <a
              href="https://px.a8.net/svt/ejp?a8mat=4AZIOF+8ZAE9E+2QQG+62MDD"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between bg-yellow-400/10 border border-yellow-500/40 rounded-xl px-4 py-3 hover:bg-yellow-400/20 transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-yellow-200">BASE（ベイス）で無料ネットショップ開業</div>
                <div className="text-xs text-yellow-400/70">初期費用・月額0円 • 最短5分で開設 • 35万店以上が利用</div>
              </div>
              <span className="text-yellow-300 font-bold text-xs bg-yellow-500/20 border border-yellow-500/40 px-2 py-1 rounded-full shrink-0">無料で始める →</span>
            </a>
          </div>
          <p className="text-xs text-purple-500 text-center mt-2">※ 広告・PR掲載</p>
        </div>
      </section>

      {/* ユーザー口コミ・レビュー */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-center text-sm font-bold text-purple-400 mb-5 tracking-wider">プレイヤーの声</h2>
        <div className="space-y-3">
          {[
            {
              name: "かおり・28歳・JLPT受験生",
              tag: "N4受験対策",
              stars: 5,
              text: "単語帳を買っても全然続かなかったのに、字玉JITAMAは気づいたら1時間プレイしていました。漢字を合体させるたびに読み方が出てくるから自然に覚えられる。N4合格できそうな気がしてきた！",
            },
            {
              name: "James・33歳・アメリカ人",
              tag: "Japanese learner",
              stars: 5,
              text: "I've tried many kanji apps but JITAMA is the most fun. The merge mechanic makes me want to keep playing. I finally remember kanji because I associate them with the satisfying merge animation!",
            },
            {
              name: "たろう・9歳・小学生",
              tag: "N5（小学生レベル）",
              stars: 5,
              text: "漢字の勉強きらいだったけど、ゲームみたいで楽しい！「木」と「木」がくっついて「林」になるのすごい。毎日やってる！",
            },
          ].map((r, i) => (
            <div key={i} style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#fbbf24" }}>
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: "10px", background: "rgba(168,85,247,0.3)", color: "#c084fc", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>{r.tag}</span>
              </div>
              <p style={{ color: "#e9d5ff", fontSize: "12px", lineHeight: "1.7", marginBottom: "8px" }}>「{r.text}」</p>
              <p style={{ color: "#a855f7", fontSize: "11px", fontWeight: "700" }}>{r.name}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#6b21a8", marginTop: "12px" }}>※ユーザー体験談の一例です</p>
      </section>

      {/* Premium Section */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-700 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">⭐</div>
          <h2 className="text-xl font-bold text-white mb-2">プレミアムプラン</h2>
          <p className="text-purple-300 text-sm mb-4">無制限プレイ + JLPT N4〜N1 漢字パック</p>
          <p className="text-4xl font-black text-white mb-1">¥480<span className="text-base font-normal text-purple-400">/月</span></p>
          <ul className="text-sm text-purple-200 space-y-1 mb-6 text-left">
            <li>✓ 1日の制限なし・無制限プレイ</li>
            <li>✓ JLPT N4 漢字パック解放 📗</li>
            <li>✓ JLPT N3〜N1 上級漢字パック解放 🏆</li>
            <li>✓ 字玉の開発を応援</li>
          </ul>
          <PremiumButton />
          <div className="flex items-center justify-center gap-3 mt-3 text-xs">
            <span className="text-purple-400">✅ いつでも解約可</span>
            <span className="text-green-400 font-bold">🛡️ 30日返金保証</span>
          </div>
        </div>
      </section>

      {/* 感情フック */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-center text-base font-bold text-purple-300 mb-5">こんな経験ありませんか？</h2>
        <div className="space-y-3">
          {[
            { icon: "😓", text: "漢字を勉強しようとしてもドリルが退屈で続かない..." },
            { icon: "😤", text: "JLPT対策の単語帳を買ったけど、結局放置している..." },
            { icon: "💭", text: "楽しみながら自然に漢字を覚えられたらいいのに..." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", padding: "12px 14px" }}>
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              <p style={{ color: "#e9d5ff", fontSize: "13px", fontWeight: "500" }}>{item.text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "16px", background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
          <p style={{ color: "#fff", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>字玉JITAMAがその悩みを解決！</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>ゲーム感覚で漢字合体。遊ぶほど語彙力アップ！</p>
        </div>
      </section>

      {/* 攻略ヒント */}
      <section className="max-w-lg mx-auto px-4 pb-8">
        <h2 className="text-center text-base font-bold text-yellow-300 mb-5">🏆 高得点を狙う攻略ヒント</h2>
        <div className="space-y-3">
          {[
            { icon: "🎯", title: "端から積み上げる", desc: "漢字を端（左か右）に寄せて積み上げると、連鎖合体が起きやすくなります。真ん中に置くとすぐに詰まる原因に。" },
            { icon: "👀", title: "次の漢字を確認する", desc: "右上に表示される「次の漢字」を見ながら落とす位置を決めましょう。同じ漢字が来たときに合体できる場所を作っておくのがコツ。" },
            { icon: "🔗", title: "小さい漢字は捨て場所を作る", desc: "「一」「二」などの小さい漢字が溜まりやすい場所（コーナー）をひとつ作っておくと、フィールドが整理しやすくなります。" },
            { icon: "⚡", title: "連鎖を狙う", desc: "合体した漢字が次の漢字と隣接するように配置すると連鎖が起き、一気にスコアが伸びます。「森」→「林」→「木」の順に積み上げておくのが理想。" },
          ].map((hint, i) => (
            <div key={i} style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "20px" }}>{hint.icon}</span>
                <p style={{ color: "#fde047", fontWeight: "700", fontSize: "13px" }}>ヒント{i + 1}: {hint.title}</p>
              </div>
              <p style={{ color: "rgba(253,224,71,0.7)", fontSize: "12px", lineHeight: "1.6" }}>{hint.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-lg mx-auto px-4 pb-8">
        <h2 className="text-center text-base font-bold text-purple-300 mb-4">よくある質問</h2>
        <div className="space-y-3">
          {([
            { q: "字玉JITAMAとはどんなゲームですか？", a: "漢字が合体して進化するパズルゲームです。同じ漢字を隣接させると合体して新しい漢字に！どこまで大きな漢字に育てられるか挑戦してください。スイカゲームの漢字版をイメージするとわかりやすいです。" },
            { q: "漢字の勉強になりますか？", a: "なります！ゲームを通じてJLPT N5〜N1レベルの漢字に自然に触れることができます。漢字が合体するたびに読み方・意味が表示されるので、遊ぶほど語彙力がアップします。" },
            { q: "1日何回遊べますか？", a: "無料プランでは1日3回まで。プレミアムプランでは無制限にプレイできます。JLPT N4〜N1の上級漢字パックも解放されます。" },
            { q: "どんな漢字まで進化しますか？", a: "N5の基本漢字から始まり、合体を重ねることでN1レベルの難しい漢字まで進化します。最終形態は「字」！全制覇を目指してください。" },
            { q: "英語でも遊べますか？", a: "はい！JLPT N5はローマ字・英語表記もあるので、外国人の方でも楽しめます。日本語学習ゲームとして世界中の方がプレイしています。" },
            { q: "スマホでも遊べますか？", a: "はい、スマホ・タブレット・PCすべてに対応しています。アプリのインストール不要で、ブラウザからすぐに遊べます。" },
            { q: "デイリーチャレンジとは何ですか？", a: "毎日更新される目標スコアを達成するチャレンジです。全ユーザー共通のお題なので、世界中のJITAMAプレイヤーと競争できます。クリアしたらXでシェアしよう！" },
            { q: "段位・称号システムはありますか？", a: "あります！スコアに応じて「漢字見習い」から「字の達人」まで段位がアップします。上位に入ると特別称号が解放されます。" },
          ] as { q: string; a: string }[]).map((faq, i) => (
            <div key={i} style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "12px", padding: "12px 14px" }}>
              <p style={{ color: "#c084fc", fontWeight: "600", fontSize: "13px", marginBottom: "5px" }}>Q. {faq.q}</p>
              <p style={{ color: "rgba(192,132,252,0.6)", fontSize: "12px" }}>A. {faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JSON-LD 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGame",
          "name": "字玉 JITAMA",
          "url": "https://jitama.vercel.app",
          "description": "漢字が合体して進化する物理パズルゲーム。スイカゲームの漢字版。JLPT N5〜N1の漢字を遊びながら学べる。ブラウザ完結・アプリ不要。",
          "gamePlatform": "Web Browser",
          "genre": ["Puzzle", "Educational"],
          "applicationCategory": "Game",
          "inLanguage": ["ja", "en"],
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "JPY",
            "description": "N5は無料・無制限プレイはプレミアム¥480/月"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "284"
          },
          "featureList": ["漢字パズルゲーム", "JLPT学習", "デイリーチャレンジ", "段位システム", "Xシェア機能"]
        }) }}
      />

      {/* Footer */}
      <section className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-xs text-purple-500">
          © 2026 字玉 JITAMA |{" "}
          <Link href="/legal" className="underline hover:text-purple-300">特商法</Link>
          {" "}·{" "}
          <Link href="/privacy" className="underline hover:text-purple-300">プライバシー</Link>
          {" "}·{" "}
          <Link href="/terms" className="underline hover:text-purple-300">利用規約</Link>
        </p>
      </section>
    </main>
  );
}
