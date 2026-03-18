import Link from "next/link";

export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-white">
      <h1 className="text-2xl font-bold mb-8">利用規約</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第1条（適用）</h2>
          <p>本規約は、ポッコリラボ（以下「当社」）が提供する「字玉 JITAMA」（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。</p>
        </section>
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第2条（利用登録）</h2>
          <p>本サービスは登録不要で無料プランをご利用いただけます。有料プランのご利用には、PAY.JPによる決済が必要です。</p>
        </section>
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第3条（禁止事項）</h2>
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
            <li>本サービスの不正利用・クラッキング</li>
            <li>他のユーザーへの迷惑行為</li>
            <li>法令または公序良俗に違反する行為</li>
            <li>本サービスの運営を妨害する行為</li>
          </ul>
        </section>
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第4条（有料サービス）</h2>
          <p>有料プランの料金は月額¥480です。解約はマイページよりいつでも可能で、解約月末をもってサービスが終了します。デジタルコンテンツの性質上、原則として返金は行いません。</p>
        </section>
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第5条（免責事項）</h2>
          <p>当社は、本サービスに関して生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。</p>
        </section>
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第6条（変更）</h2>
          <p>当社は、必要と判断した場合には、本規約を変更することがあります。変更後の規約は本ページに掲載した時点で効力を生じます。</p>
        </section>
        <section>
          <h2 className="text-purple-400 font-bold mb-2">第7条（準拠法・管轄裁判所）</h2>
          <p>本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して生じた紛争については、名古屋地方裁判所を専属的合意管轄とします。</p>
        </section>
        <p className="text-gray-500 text-xs">制定日：2026年1月1日</p>
      </div>
      <Link href="/" className="mt-8 inline-block text-purple-400 underline text-sm">← トップへ</Link>
    </main>
  );
}
