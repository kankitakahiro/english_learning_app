const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const fs = require('fs').promises;
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');

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

/** min以上max以下の整数値の乱数を返す */
function intRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// jsonをパースする
app.use(express.json());

// root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ログインのトークンを調べる
app.use(async (req, res, next) => {
    try {
        const idToken = req.headers.authorization;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.status = decodedToken.uid;
        next();
    } catch (error) {
        console.log(error);
        req.status = false;
        next();
    }
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
// 重複しない乱数を生成する非同期関数
async function generateUniqueRandoms(min, max, count) {
    const randoms = [];
    while (randoms.length < count) {
        const random = await intRandom(min, max);
        if (!randoms.includes(random)) {
            randoms.push(random);
        }
    }
    return randoms;
}

// app.get('/lesson-test', (req, res) => {
//     // req.queryでクエリパラメータにlessonと単語番号が入っている
//     // 例: http://localhost:8080/lesson-test?lesson=1&number=1
//     const lesson = req.query.lesson;
//     const number = req.query.number;

//     if (lesson === undefined || number === undefined) {
//         res.status(400).send('Bad Request');
//         return;
//     }
// });

// テスト用のエンドポイント
// app.get('/lesson-test', (req, res) => {
//     // req.queryでクエリパラメータにlessonと単語番号が入っている
//     // 例: http://localhost:8080/lesson-test?lesson=1&number=1
//     const lesson = req.query.lesson;
//     const number = req.query.number;
//     if (lesson === undefined || number === undefined) {
//         res.status(400).send('Bad Request');
//         return;
//     }
//     fs.readdir('./b64_data', (err, files) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Internal Server Error 1');
//             return;
//         }
//         let image_data;
//         // .txt ファイルだけをフィルタリング
//         // const textFiles = files.filter(file => path.extname(file) === '.text');
//         try {
                
//                 // クエリを実行
//                 pool.query("SELECT * FROM question where lesson = ?", [lesson], (err, results) => {
//                     if (err) throw err;
//                     // console.log(results);
//                     // ランダムな .txt ファイルを選ぶ
//                     /** 重複チェック用配列 */
//                     var randoms = [];
//                     /** 最小値と最大値 */
//                     var min = 0, max = results.length;
                    
//                     /** 重複チェックしながら乱数作成 */
//                     for(i = min; i <= 3; i++){
//                         while(true){
//                             var tmp = intRandom(min, max);
//                             if(!randoms.includes(tmp)){
//                                 randoms.push(tmp);
//                                 break;
//                             }
//                         }
//                     }
//                     const answer = results[randoms[0]];
//                     const wronge1 = results[randoms[1]];
//                     const wronge2 = results[randoms[2]];
//                     const wronge3 = results[randoms[3]];
//                     console.log(answer);
//                     console.log(wronge1);
//                     console.log(wronge2);
//                     console.log(wronge3);
//                     // ファイルの内容を読み取る
//                     fs.readFile(path.join('./b64_data', answer.image), 'utf8', (err, data) => {
//                         if (err) {
//                             res.status(500).send('Internal Server Error 2');
//                             return;
//                         }
//                         image_data = data;

//                         ans = answer.word;
//                         item_list = [answer.word, wronge1.word, wronge2.word, wronge3.word] // シャッフル

//                         // console.log(image_data);
//                         // base64形式で返す
//                         res.header('Access-Control-Allow-Origin', '*');
//                         res.json({
//                             "id": 1,
//                             "ans":ans,
//                             "item_list":item_list,
//                             "image": "data:image/png;base64," + image_data,
//                         });
//                     });
//                 });
//             } catch (err) {
//                 console.error('データベース操作エラー:', err);
//                 res.status(500).send('データベース操作エラー');
//             }
//     });
// });
// 問題の単語一覧を取得する.
async function getDirectoryNames(directoryPath, level) {
    try {
        const files = await fs.readdir(directoryPath, {withFileTypes: true});
        var words = [];
        for (const file of files) {
            if (file.isDirectory()) {
                let reg = new RegExp(level);
                // console.log(reg)
                if (reg.test(file.name)){
                    wordParh = path.join(file.path,file.name);
                    const wordFiles = await fs.readdir(wordParh, {withFileTypes: true});
                    for (const fileFile of wordFiles) {
                        if (fileFile.isDirectory()) {
                            words.push(fileFile);
                        }
                    }
                }

            }
        }
        return words;
    } catch (error) {
        console.error('ディレクトリの取得エラー:', error);
        throw error;
    }
}
// テスト用のエンドポイント
app.get('/ilesson-test', async (req, res) => {
    // req.queryでクエリパラメータにlessonと単語番号が入っている
    // 例: http://localhost:8080/ilesson-test?lesson=1&number=1
    const lesson = req.query.lesson;
    const number = req.query.number;
    if (lesson === undefined || number === undefined) {
        res.status(400).send('Bad Request');
        return;
    }
    // 問題のレベルを取得
    console.log(lesson);
    let level;
    if (lesson === '1'){
        level = 'B1' ;
    }else if (lesson === '2'){
        level = 'B2';
    }else if (lesson === '3'){
        level = 'daily';
    }else if (lesson === '4'){
        level = 'special';
    }else{
        level = 'error';
    }
    // console.log(level);
    

        // ディレクトリパスを指定してディレクトリ名を取得
    const directoryPath = './new_data_set/data';
    let words; //  画像が入っているディレクトリ名とパスが入っている.
    try {
        words = await getDirectoryNames(directoryPath, level);
        // console.log('ディレクトリ名:', words);
    } catch (error) {
        console.error('エラー:', error);
    }
    // console.log(words);

    var randoms;
    /** 最小値と最大値 */
    var min = 0, max = words.length;
    try{
        randoms = await generateUniqueRandoms(min, max, 4)
    }catch(error) {
        console.error('エラー:', error);
    }
    // console.log(answer,wrong1)
    let selectWords = [words[randoms[0]],words[randoms[1]],words[randoms[2]],words[randoms[3]]];
    console.log(selectWords);
    var count = 0;
    let item_list = [];
    let ansWords
    for (const q of words) {
        try {
            const [data, fields] = await pool.execute(
                'SELECT * FROM lesson_data WHERE word_name = ?',
                [q.name]
            );
            console.log(data);
    
            const min = 0;
            const max = data.length;
    
            const imageRandom = await generateUniqueRandoms(min, max, 1);
            console.log(imageRandom);
    
            const targetData = data[imageRandom[0]];
            console.log(targetData);
    
            const fileName = targetData.word_name + '/image' + targetData.image_id + '.text';
            const filePath = path.join(q.path, fileName);
            console.log(filePath);
    
            let image;
            try {
                image = await fs.readFile(filePath, 'utf-8');
                console.log(image);
            } catch (error) {
                console.error('エラー:', error);
            }
    
            item_list.push(image);
    
            if (count === 0) {
                ansWords = targetData.sentence;
            }
    
            count = count + 1;
        } catch (error) {
            console.error('エラー:', error);
        }
    }
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        "word":ansWords,
        "ans":0,
        "image": item_list,
    });




});

// ルートハンドラーの定義
// ルートハンドラーの定義
app.get('/mysql', async (req, res) => {
    try {

        // クエリの実行
        const [rows, fields] = await pool.execute(
            'SELECT count(*) FROM lesson_data'
            );
        console.log(rows,fields);
        
        // データベース接続を閉じる
        pool.end();

        console.log("development");
        res.send(rows); // クエリの結果をクライアントに返す例
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
