# VISION アプリケーション

visionアプリケーションへようこそ。<br>
英単語を日本語を返すことなく英語のまま勉強しましょう。

## 環境構築
**このアプリケーションはdockerを使用します** <br>
適当なディレクトリに移動しこのリポジトリをクローンしてください

```bash
git clone git@github.com:kankitakahiro/english_learning_app.git
```

その後クローンしたディレクトリに移動し以下のコマンドでdockerのコンテナを起動することができます。

```bash
docker-compose up -d
```

ローカル環境の場合 http://localhost:3000/ でアプリケーションにアクセスできます。

## 開発者の方
サーバーへのアクセス<br>
node http://localhost:8080/ <br>
react http://localhost:3000/

dockerコンテナへのアクセス
```bash
docker exec -it node /bin/bash  # node コンテナ
docker exec -it react /bin/bash # react コンテナ
docker exec -it db /bin/bash    # db コンテナ
```

## 目標
- データベース (kanki)
- ログイン (引き継ぎ) -> 名前, 進捗とか表示させる (kido)
- ユーザーのオリジナルの画像 upload (front:kido, back:yamamoto)
- エラー直す, リファクタリング -> 問題文 list(yamamoto)
- 資料の修正, 練習 (金曜日)

---

金曜日に時間があれば
- 画像の修正
- 音声 ??

