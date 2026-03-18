"use client";

import KomojuButton from "./KomojuButton";

export default function PremiumButton() {
  return (
    <KomojuButton
      planId="standard"
      planLabel="プレミアムにアップグレード"
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors text-lg disabled:opacity-50"
    />
  );
}
