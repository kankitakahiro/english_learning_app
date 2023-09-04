FROM node
# アプリケーションディレクトリを作成する
WORKDIR /app
# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
# COPY ./frontend/react/ /app

# 本番用にコードを作成している場合
# RUN npm install --only=production
# アプリケーションのソースをバンドルする
COPY . /usr/src/app
EXPOSE 3000
CMD [ "node", "server.js" ]