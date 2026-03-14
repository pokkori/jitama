"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PayjpModal from "./PayjpModal";

export default function PremiumButton() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const publicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "";

  const handleSuccess = () => {
    setShowModal(false);
    router.push("/success");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors text-lg"
      >
        プレミアムにアップグレード
      </button>

      {showModal && (
        <PayjpModal
          publicKey={publicKey}
          planLabel="プレミアムプラン ¥480/月 — 無制限プレイ"
          onSuccess={handleSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
