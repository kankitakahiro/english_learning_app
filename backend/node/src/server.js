const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const fs = require('fs').promises;
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const mysql = require('mysql');

// 本番環境の時はDockerfileでNODE_ENV=productionを指定してください
// ここで環境変数を指定します
let firebase_private_key;
let mysql_conf;
if (process.env.NODE_ENV !== "production") { // production is 本番環境
    dotenv.config(); // .envファイルを読み込む
    firebase_private_key = process.env.private_key; // .envファイルからfirebaseの秘密鍵を取得
    mysql_conf = {
        connectionLimit: process.env.CONNECTION_LIMIT,
        host: process.env.INSTANCE_HOST, // Cloud SQL Proxy コンテナのサービス名
        port: process.env.DB_PORT, // Cloud SQL Proxy がリッスンしているポート
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    };
    console.log("development");
} else {
    firebase_private_key = process.env.private_key.replace(/\\n/g, '\n'); // 本番環境では改行コードが\nになっているので、それを置換
    mysql_conf = {
        user: process.env.DB_USER, // e.g. 'my-db-user'
        password: process.env.DB_PASS, // e.g. 'my-db-password'
        database: process.env.DB_NAME, // e.g. 'my-database'
        socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
    };
    console.log("production");
}

// firebaseの設定を環境変数から取得
const serviceAccount = {
    "type": process.env.apiKey,
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": firebase_private_key,
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url,
    "universe_domain": process.env.universe_domain
}
// firebaseの初期化
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// mysqlの初期化
const pool = mysql.createPool(mysql_conf);

// reactのビルドファイルを読み込む
app.use(express.static(path.join(__dirname, 'build')));

// jsonをパースする
app.use(express.json());

// root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ログイン認証
// ユーザーの新規登録はfirebaseに直接アクセスして行う
app.post('/verifyToken', async (req, res) => {
    const idToken = req.body.token;
    // console.log(idToken);
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // decodedTokenにはUIDとその他のクレームが含まれます。
        console.log(decodedToken.uid, 'is log in'); // これがユーザーのUIDです。

        res.header('Access-Control-Allow-Origin', '*'); // for development

        res.json(decodedToken);

        console.log("ok");

        // Mysqlの処理を書く

    } catch (error) {
        res.status(401).send('Token is not valid');
    }
});

// ********************************** ここから *******************************************************

/** min以上max以下の整数値の乱数を返す */
function intRandom(min, max){
    return Math.floor( Math.random() * (max - min + 1)) + min;
}

app.get('/development-mysl/init-table', async(req, res) => {
    const table_name = req.query.table_name;

    if (table_name === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    if (table_name !== 'lesson_data' || table_name !== 'user_data' || table_name !== 'user_lesson') {
        res.status(400).send('Bad Request');
        return;
    }

    // pool.query('DROP TABLE lesson_data', (err, results) => {
    //     if (err) throw err;
    //     console.log(results);
    // });

    const query = `SHOW TABLES LIKE ?`;
    let ans;
    pool.query(query, [table_name], (err, results) => {
        if (err) throw err;
        
        ans = results;
        if (ans.length === 0) {
            console.error('テーブルが存在しません。テーブルを作成します。');
            // primary key(int) | word_name(str) | level(str) | type(str) | sentence(str) | image_id(int) |
            const query = `CREATE TABLE ${table_name} (
                id INT NOT NULL AUTO_INCREMENT,
                word_name VARCHAR(255) NOT NULL,
                level VARCHAR(255) NOT NULL,
                type VARCHAR(255) NOT NULL,
                sentence VARCHAR(255) NOT NULL,
                image_id INT NOT NULL,
                PRIMARY KEY (id)
            )`;
            pool.query(query, (err, results) => {
                if (err) throw err;
                console.log(results);
            });
        } else {
            console.error('テーブルが存在します。');
            return;   
        }
    });    
});

app.get('/lesson-test', (req, res) => {
    // req.queryでクエリパラメータにlessonと単語番号が入っている
    // 例: http://localhost:8080/lesson-test?lesson=1&number=1
    const lesson = req.query.lesson;
    const number = req.query.number;

    if (lesson === undefined || number === undefined) {
        res.status(400).send('Bad Request');
        return;
    }
});

// テスト用のエンドポイント
app.get('/lesson-test', (req, res) => {
    // req.queryでクエリパラメータにlessonと単語番号が入っている
    // 例: http://localhost:8080/lesson-test?lesson=1&number=1
    const lesson = req.query.lesson;
    const number = req.query.number;
    if (lesson === undefined || number === undefined) {
        res.status(400).send('Bad Request');
        return;
    }
    fs.readdir('./b64_data', (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error 1');
            return;
        }
        let image_data;
        // .txt ファイルだけをフィルタリング
        // const textFiles = files.filter(file => path.extname(file) === '.text');
        try {
                
                // クエリを実行
                pool.query("SELECT * FROM question where lesson = ?", [lesson], (err, results) => {
                    if (err) throw err;
                    // console.log(results);
                    // ランダムな .txt ファイルを選ぶ
                    /** 重複チェック用配列 */
                    var randoms = [];
                    /** 最小値と最大値 */
                    var min = 0, max = results.length;
                    
                    /** 重複チェックしながら乱数作成 */
                    for(i = min; i <= 3; i++){
                        while(true){
                            var tmp = intRandom(min, max);
                            if(!randoms.includes(tmp)){
                                randoms.push(tmp);
                                break;
                            }
                        }
                    }
                    const answer = results[randoms[0]];
                    const wronge1 = results[randoms[1]];
                    const wronge2 = results[randoms[2]];
                    const wronge3 = results[randoms[3]];
                    console.log(answer);
                    console.log(wronge1);
                    console.log(wronge2);
                    console.log(wronge3);
                    // ファイルの内容を読み取る
                    fs.readFile(path.join('./b64_data', answer.image), 'utf8', (err, data) => {
                        if (err) {
                            res.status(500).send('Internal Server Error 2');
                            return;
                        }
                        image_data = data;

                        ans = answer.word;
                        item_list = [answer.word, wronge1.word, wronge2.word, wronge3.word] // シャッフル

                        // console.log(image_data);
                        // base64形式で返す
                        res.header('Access-Control-Allow-Origin', '*');
                        res.json({
                            "id": 1,
                            "ans":ans,
                            "item_list":item_list,
                            "image": "data:image/png;base64," + image_data,
                        });
                    });
                });
            } catch (err) {
                console.error('データベース操作エラー:', err);
                res.status(500).send('データベース操作エラー');
            }
    });
});

// ルートハンドラーの定義
app.get('/mysql',  (req, res) => {
    try {
        dotenv.config();
            // 例: クエリの実行
        pool.query('SELECT count(*) FROM lesson_data', (err, results) => {
            if (err) throw err;
            console.log(results);
        });
        console.log("development");
    } catch (err) {
        console.error('データベース操作エラー:', err);
        res.status(500).send('データベース操作エラー');
    }
});

// ********************************** ここまで *******************************************************

/**
 * table lesson_data -> 単語のデータ
 * ____________________________________________________
 * id | word_name | level | type | sentence | image_id |
 * ____________________________________________________
 * is : primary key
 * word : 単語の名前
 * level : 単語のレベル(B1,B2,C1,C2,daily, countable-uncountable)
 * type : 単語のタイプ(noun, verb, mix, other)
 * sentence : 単語の例文
 * image_id : 単語の番号(image1 〜 max(image4))
 * 
 * 
 * tabele user_data -> ユーザーのデータ
 * __________________________
 * id | user_name | user_id |
 * __________________________
 * id : primary key
 * user_name : ユーザーの名前
 * user_id : ユーザーのID(firebaseのUID)
 * 
 * 
 * table user_lesson　-> ユーザーの学習データ
 * _____________________________________
 * id | word_name | user_id | image_id |
 * _____________________________________
 * id : primary key
 * word_name : 単語の名前
 * user_id : ユーザーのID(firebaseのUID)
 * image_id : 単語の番号(image1 〜 max(image4))
 */

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
