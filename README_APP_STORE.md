# 字玉 JITAMA — App Store / Google Play 申請情報

## 基本情報

| 項目 | 値 |
|---|---|
| アプリ名（日本語） | 字玉 JITAMA - 漢字マージパズル |
| アプリ名（英語） | Jitama - Kanji Merge Puzzle |
| バンドルID (iOS) | app.vercel.jitama |
| Application ID (Android) | app.vercel.jitama |
| バージョン | 1.0.0 |
| ビルド番号 | 1 |
| カテゴリ | Games > Puzzle |
| 年齢制限 | 4+ (iOS) / Everyone (Android) |
| 価格 | 無料（アプリ内課金あり） |
| 対応言語 | 日本語、英語 |

---

## アプリ内課金

| 名称 | タイプ | 金額 |
|---|---|---|
| プレミアムプラン | 自動更新サブスクリプション | ¥480/月 |

---

## 説明文（日本語）

**短い説明（80文字以内）**
```
落ちてくる漢字玉を合体させる新感覚パズルゲーム。JLPT対応・脳トレにも最適！
```

**長い説明（4000文字以内）**
```
字玉（JITAMA）は、スイカゲームのように落下する「漢字玉」を合体させて
より複雑な漢字を作っていく、新感覚の漢字パズルゲームです。

【遊び方】
・画面をタップして漢字玉を落とす
・同じ漢字が2つぶつかると合体して上の漢字へ進化！
・玉が画面上部を超えるとゲームオーバー
・より大きな漢字を作ってハイスコアを目指そう

【こんな方におすすめ】
・漢字が好き・漢字を学びたい方
・JLPT（日本語能力試験）N5〜N1の学習中の方
・外国語として日本語を勉強している方
・ちょっとした空き時間に脳トレをしたい方
・スイカゲームやマージ系ゲームが好きな方

【特徴】
・JLPT N5〜N1レベルの漢字を段階的に収録
・美しい筆文字フォントで漢字の形を自然に覚えられる
・スコアをXでシェアして友だちと競おう
・プレミアムプランで全漢字・全部首パックが使い放題

漢字を楽しく・直感的に覚えながら、ハイスコアを競ってください！
```

---

## 説明文（英語）

**Short Description**
```
A physics-based merge puzzle game featuring Japanese Kanji characters. Perfect for JLPT learners!
```

**Full Description**
```
Jitama is a physics-based merge puzzle game where you drop and merge Kanji characters
— inspired by the viral "Suika Game" (Watermelon Game) format.

HOW TO PLAY:
• Tap to drop a Kanji ball onto the playing field
• When two identical Kanji touch, they merge and evolve into a more complex character!
• The game ends when balls stack above the top line
• Aim for the highest score by chaining merges

FEATURES:
• Kanji from JLPT N5 to N1 levels included
• Beautiful brush-stroke font helps you naturally learn character shapes
• Share your score on X (Twitter) and compete with friends
• Premium plan unlocks all Kanji sets and radical packs

GREAT FOR:
• Japanese language learners (JLPT N5–N1)
• Anyone who loves kanji or Japanese culture
• Fans of merge/drop puzzle games
• Brain training on the go
```

---

## キーワード

**iOS App Store（100文字以内）**
```
漢字,漢字ゲーム,パズル,脳トレ,JLPT,kanji,puzzle,merge,日本語学習,漢字学習
```

**Google Play（5つ以内・各文字数制限なし）**
```
漢字パズル, JLPT学習ゲーム, kanji merge puzzle, 脳トレゲーム, 漢字マージ
```

---

## スクリーンショット撮影リスト

### iOS（iPhone 6.7インチ = iPhone 15 Pro Max: 1290×2796px）
1. タイトル画面 / LP（`https://jitama.vercel.app/`）
2. ゲームプレイ中（漢字玉が落ちている状態）
3. 合体エフェクト瞬間（ゲームプレイ中に撮影）
4. ハイスコア結果画面
5. プレミアム購入画面（`/game` のプレミアムボタン）

### Android（スマートフォン: 1080×1920px 以上）
1〜5 は iOS と同じ画面をAndroid実機またはエミュレータで撮影

### iPad（オプション・12.9インチ: 2048×2732px）
- タブレット対応を確認してから追加

---

## プライバシーポリシー URL

```
https://jitama.vercel.app/privacy
```

## 利用規約 URL

```
https://jitama.vercel.app/legal
```

---

## サポート情報

| 項目 | 内容 |
|---|---|
| 運営者 | ポッコリラボ 代表 新美 |
| 問い合わせ | X(Twitter) @levona_design へDM |
| Web | https://jitama.vercel.app |

---

## 技術構成（レビュアー向け補足）

- アプリはCapacitor WebView shell として動作し、コンテンツは `https://jitama.vercel.app` から配信
- ゲームエンジン: Phaser.js 3（Canvas/WebGL描画）
- 決済: PAY.JP（日本のカード決済代行）
- ネットワーク接続が必要（オフライン未対応）

---

## ネイティブプロジェクト初回セットアップ手順（pokkori用）

### 前提ツール
- **iOS**: macOS + Xcode 15以上（Mac必須）
- **Android**: Android Studio Ladybug以上（WindowsでもOK）

### セットアップ手順

```bash
# 1. CapacitorプラットフォームをOSに追加
cd "D:\99_Webアプリ\漢字マージ"
npx cap add android    # Windowsで実行可
# npx cap add ios      # macOSのみ実行可

# 2. Webアセットを同期（Vercel URL を使うので next build は不要）
npx cap sync

# 3. Android Studioで開く
npm run cap:open:android
# → Android Studio が起動したら Run ボタンでエミュレータ or 実機にインストール

# 4. iOS（Macが必要）
# npm run cap:open:ios
# → Xcode が起動したら署名設定して実機/シミュレータにインストール
```

### Android APK / AAB ビルド（Google Play用）
```
Android Studio > Build > Generate Signed Bundle/APK
→ Android App Bundle (.aab) を選択
→ キーストア作成 or 既存キーストア使用
→ Release ビルド生成
→ Google Play Console にアップロード
```

### iOS IPA ビルド（App Store用、Mac必須）
```
Xcode > Product > Archive
→ Distribute App > App Store Connect
→ 自動署名で Upload
```

---

## App Store Connect / Google Play Console 設定チェックリスト

- [ ] App Store Connect でアプリ新規作成（Bundle ID: app.vercel.jitama）
- [ ] Google Play Console でアプリ新規作成（Package name: app.vercel.jitama）
- [ ] スクリーンショット撮影・アップロード
- [ ] アプリアイコン準備（1024×1024px PNG・角丸なし・透過なし）
- [ ] プレビュー動画（オプション）
- [ ] 年齢レーティング質問票に回答
- [ ] アプリ内課金（サブスク）を各ストアで設定
- [ ] プライバシーポリシーURL設定
- [ ] 審査申請
