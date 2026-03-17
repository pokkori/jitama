import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const SITE_URL = "https://jitama.vercel.app";
const TITLE = "字玉 JITAMA — 漢字マージパズル";
const DESC = "漢字の部首を落として合体させる物理パズルゲーム。スイカゲーム式で老若男女が遊べる。JLPT N5〜N1対応。無料でプレイ。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1F004;</text></svg>" },
  openGraph: {
    title: TITLE,
    description: "部首を落として合体！漢字が進化する物理パズル。スイカゲーム式で誰でも遊べる。",
    url: SITE_URL,
    siteName: "字玉 JITAMA",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: "部首を落として合体！漢字が進化する物理パズル。",
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
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
