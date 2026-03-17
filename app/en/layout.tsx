import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanji Merge Game — Learn JLPT Kanji While Playing | JITAMA",
  description:
    "Merge kanji to learn Japanese! The only game that teaches JLPT N5-N1 vocabulary through fun physics puzzle gameplay.",
  openGraph: {
    title: "JITAMA — Kanji Merge Game",
    description: "Learn Japanese kanji through physics puzzle! JLPT N5-N1 support.",
    url: "https://jitama.vercel.app/en",
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
