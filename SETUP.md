# セットアップ手順

## 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. **Firestore Database** を有効化（本番モード or テストモード）
3. プロジェクト設定 → アプリ追加（Web）→ config をコピー

## 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成：

```bash
cp .env.example .env.local
```

`.env.local` に Firebase の config を貼り付け。

## 3. Firestore セキュリティルール

Firebase Console → Firestore → ルール で `firestore.rules` の内容を設定。

## 4. 起動

```bash
npm install
npm run dev
```

## 使い方

1. `/` にアクセス → 「新しい旅程を作る」
2. URLが `/trip/{tripId}` に変わる
3. このURLを共有すれば全員がリアルタイムで同期
4. 予定追加 → 時刻・タイトルを入力して「追加」
5. カードの ✏️ で編集、🗑️ で削除（2回タップで確認）
