# english_learning_app

## 環境構築

参考サイト : https://ramble.impl.co.jp/2588/

### 初回実行時に必要な作業

branchはsettingをcloneする。

nodeディレクトリに移動し、コンテナを起動する。

    docker-compose run --rm --no-deps node /bin/bash

コンテナ内でnpmとnodemonのinstall

    npm install
    npm install nodemon

__reactディレクトリとnodeディレクトリにある.gitkeepファイルを削除する。__

reactディレクトリに移動し、コンテナを起動する。

    docker-compose run --rm --no-deps react /bin/bash

コンテナ内でreactのinstall

    npm install -g npm
    npm install -g create-react-app
    npx create-react-app .
    npm install

__reactディレクトリ内の.gitignoreファイルは必要ないため削除する__

作業が終了したら通常の実行手順を行いコンテナを起動する。

### 通常の実行手順

コンテナ起動: 

    docker-compose up -d

express:

    http://localhost:3000/

react:

    http://localhost:8080/

reactの起動に時間がかかる。

db:

    次のコマンドでコンテナに入る

    docker-compose exec db /bin/bash

    次のコマンドでmysqlに入る

    mysql -u talps -p

    パスワードは.envファイルを参照
