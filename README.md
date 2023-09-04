# english_learning_app

## 環境構築

参考サイト : https://ramble.impl.co.jp/2588/

コンテナ起動: 

    docker-compose up -d

express

    http://localhost:3000/

react

    http://localhost:8080/

db

    次のコマンドでコンテナに入る

    docker-compose exec db /bin/bash

    次のコマンドでmysqlに入る

    mysql -u talps -p

    パスワードは.envファイルを参照
