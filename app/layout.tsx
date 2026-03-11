import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "字玉 JITAMA — 漢字マージパズル",
  description:
    "漢字の部首を落として合体させる物理パズルゲーム。スイカゲーム式で老若男女が遊べる。JLPT N5〜N1対応。",
  openGraph: {
    title: "字玉 JITAMA — 漢字マージパズル",
    description: "部首を落として合体！漢字が進化する物理パズル",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
