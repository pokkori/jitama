import Link from "next/link";

export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-white">
      <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>
      <div className="space-y-6 text-sm text-purple-200 leading-relaxed">
        <p>本サービス「字玉 JITAMA」（以下「当サービス」）は、ユーザーのプライバシーを尊重し、以下の方針で個人情報を取り扱います。</p>
        <section>
          <h2 className="text-white font-bold mb-2">収集する情報</h2>
          <p>当サービスはスコアをブラウザのlocalStorageにのみ保存します。サーバーへの個人情報の送信は行いません（有料プランに登録した場合を除く）。</p>
        </section>
        <section>
          <h2 className="text-white font-bold mb-2">Cookie・解析ツール</h2>
          <p>Vercel Analyticsによるアクセス解析を行う場合があります。個人を特定する情報は含まれません。</p>
        </section>
      </div>
      <Link href="/" className="mt-8 inline-block text-purple-400 underline text-sm">← トップへ</Link>
    </main>
  );
}
