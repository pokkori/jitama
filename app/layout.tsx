import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const SITE_URL = "https://jitama.vercel.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "字玉 JITAMA",
      "url": SITE_URL,
      "applicationCategory": "GameApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY", "description": "無料プレイあり" },
      "description": "漢字の部首を落として合体させる物理パズルゲーム。JLPT N5〜N1対応。スイカゲーム式。",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "字玉JITAMAとはどんなゲームですか？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "字玉（JITAMA）は漢字の部首をフィールドに落として、同じ漢字が触れると合体・進化する物理パズルゲームです。スイカゲームの漢字版で、JLPT N5〜N1レベルの漢字学習にも活用できます。",
          },
        },
        {
          "@type": "Question",
          "name": "無料で遊べますか？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "はい。N5モードは無料でプレイできます。プレミアムプランに登録するとN1〜N5の全レベルを無制限でプレイできます。",
          },
        },
        {
          "@type": "Question",
          "name": "JLPT対策に使えますか？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "はい。N5〜N1レベルの漢字を収録しており、ゲームを通じて自然に漢字を覚えられます。各レベルに対応した漢字が登場するので、受験する級に合わせてプレイできます。",
          },
        },
        {
          "@type": "Question",
          "name": "スマホでも遊べますか？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "はい。ブラウザで動作するためインストール不要です。スマートフォン・タブレット・PCで快適にプレイできます。",
          },
        },
        {
          "@type": "Question",
          "name": "デイリーチャレンジとは何ですか？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "毎日変わる共通目標です。全プレイヤーが同じ目標に挑戦し、Xでシェアして競い合えます。達成すると特別なバッジが獲得できます。",
          },
        },
      ],
    },
  ],
};
const TITLE = "字玉 JITAMA — 漢字マージパズル";
const DESC = "漢字の部首を落として合体させる物理パズルゲーム。スイカゲーム式で老若男女が遊べる。JLPT N5〜N1対応。無料でプレイ。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["漢字マージ", "字玉", "JITAMA", "漢字ゲーム", "スイカゲーム 漢字", "JLPT 漢字学習", "漢字パズル", "無料ゲーム", "kanji game", "Japanese learning game"],
  alternates: {
    canonical: SITE_URL,
    languages: { "en": `${SITE_URL}/en` },
  },
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1F004;</text></svg>" },
  openGraph: {
    title: TITLE,
    description: "部首を落として合体！漢字が進化する物理パズル。スイカゲーム式で誰でも遊べる。",
    url: SITE_URL,
    siteName: "字玉 JITAMA",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/images/hero.png", width: 640, height: 360, alt: "字玉 JITAMA ゲーム画面" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "部首を落として合体！漢字が進化する物理パズル。",
    images: ["/images/hero.png"],
  },
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* Google AdSense - TODO: Replace ca-pub-XXXXXXXXXXXXXXXX with actual publisher ID */}
        {/* AdSense申請後にコメントアウトを外して有効化してください */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
