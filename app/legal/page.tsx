import Link from "next/link";

export default function Legal() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-white">
      <h1 className="text-2xl font-bold mb-8">特定商取引法に基づく表記</h1>
      <dl className="space-y-4 text-sm">
        <div><dt className="text-purple-400">販売事業者</dt><dd>ポッコリラボ</dd></div>
        <div><dt className="text-purple-400">運営責任者</dt><dd>ポッコリラボ 代表 新美</dd></div>
        <div><dt className="text-purple-400">お問い合わせ</dt><dd>X(Twitter) @levona_design へのDM</dd></div>
        <div><dt className="text-purple-400">サービス名</dt><dd>字玉 JITAMA</dd></div>
        <div><dt className="text-purple-400">無料プラン</dt><dd>ゲームプレイ無制限（無料）</dd></div>
        <div><dt className="text-purple-400">有料プラン</dt><dd>プレミアム ¥480/月（全部首パック・オンラインランキング）</dd></div>
        <div><dt className="text-purple-400">支払方法</dt><dd>クレジットカード（PAY.JP）</dd></div>
        <div><dt className="text-purple-400">解約方法</dt><dd>マイページより随時解約可能。解約月末で終了。</dd></div>
        <div><dt className="text-purple-400">返金ポリシー</dt><dd>デジタルコンテンツの性質上、原則返金不可。</dd></div>
      </dl>
      <Link href="/" className="mt-8 inline-block text-purple-400 underline text-sm">← トップへ</Link>
    </main>
  );
}
