# 旅のしおり — Travel Itinerary App

React 18 + Vite + Firebase Firestore でつくるリアルタイム旅程管理アプリ。

---

## 開発サーバー起動

```bash
npm install
npm run dev
```

---

## ビルド（Windows 注意）

Rolldown ネイティブバインディングのキャッシュ問題が出た場合:

```bash
rm -rf node_modules package-lock.json
npm install
```

その後:

```bash
npm run build
# または明示的に node パスを指定
"C:/Program Files/nodejs/node.exe" node_modules/vite/bin/vite.js build
```

---

## 環境変数

`.env` に各 API キーを設定:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_OWM_API_KEY=your_openweathermap_key
```

---

## Firebase Storage の有効化

写真添付機能（Step 4）を使うには Firebase Storage を有効にする必要があります。

### コンソールでの有効化手順

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. 対象プロジェクトを選択
3. 左メニュー「Storage」→「始める」をクリック
4. セキュリティルールの選択画面で「テストモード」を選択（後でルールを更新する）
5. ロケーションを選択（asia-northeast1 = 東京 推奨）→「完了」

### Storage セキュリティルール

`storage.rules` に以下が設定されています:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trips/{tripId}/plans/{planId}/photo {
      allow read, write: if true;
    }
  }
}
```

### デプロイ方法 ①  Firebase CLI（推奨）

```bash
# 初回のみ
npm install -g firebase-tools
firebase login
firebase use --add

# Firestore + Storage 両方まとめてデプロイ
firebase deploy --only firestore:rules,storage

# または個別に
firebase deploy --only storage
```

### デプロイ方法 ②  Firebase Console（GUI）

1. Firebase Console → Storage → 「ルール」タブ
2. `storage.rules` の内容を貼り付ける
3. 「公開」ボタンをクリック

---

## Firestore セキュリティルール

`firestore.rules` に以下のルールが設定されています（2026/12/31 まで有効）:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read, write: if request.time < timestamp.date(2026, 12, 31);
      match /plans/{planId} {
        allow read, write: if request.time < timestamp.date(2026, 12, 31);
      }
    }
  }
}
```

### デプロイ方法 ①  Firebase CLI（推奨）

```bash
firebase deploy --only firestore:rules
```

### デプロイ方法 ②  Firebase Console（GUI）

1. Firebase Console → Firestore Database → 「ルール」タブ
2. `firestore.rules` の内容を貼り付ける
3. 「公開」ボタンをクリック

---

## firebase.json（CLI 使用時に必要）

Firebase CLI でデプロイするには `firebase.json` が必要です:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```
