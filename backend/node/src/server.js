const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const fs = require('fs').promises;
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

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
    console.log("動きました")
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ログインのトークンを調べる
// app.use( async (req, res, next) => {
//     try {
//         const idToken = req.headers.authorization;
//         const decodedToken = await admin.auth().verifyIdToken(idToken);
//         req.status = decodedToken.uid;
//     } catch (error) {
//         console.log(error);
//         req.status = false;
//     }
//     next();
// });

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
// ____________________________________________________
//  * id | word_name | level | type | sentence | image_id |
//  * ____________________________________________________
const lessonToLevel = {
    "1": ["daily", "mix", "B1", "noun"],
    "2": ["B1", "verb"],
    "3": ["B2", "noun"],
    "4": ["B2", "verb"],
    "5": ["special", "noun"],
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 0からiの間のランダムなインデックスを生成
        [array[i], array[j]] = [array[j], array[i]];  // 要素を交換
    }
    return array;
}

app.get('/tlesson-test', async (req, res) => {
    console.log("tlesson");
    // req.queryでクエリパラメータにlessonと単語番号が入っている
    // 例: http://localhost:8080/lesson-test?lesson=1&number=1
    const lesson = req.query.lesson;
    const number = parseInt(req.query.number);

    const level = lessonToLevel[lesson][0];
    const type = lessonToLevel[lesson][1];

    if (lesson === undefined || number === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    let whereQeury = "WHERE level = ? AND type = ?";
    if (lesson === "1") {
        whereQeury = "WHERE ((level = ? AND type = ?) OR (level = ? AND type = ?))";
    }

    const execQuery = `
        SELECT id, word_name, level, type, sentence, image_id
        FROM (
            SELECT id, word_name, level, type, sentence, image_id,
                ROW_NUMBER() OVER(PARTITION BY word_name ORDER BY RAND()) as row_num
            FROM lesson_data
            ${whereQeury}
        ) AS subquery
        WHERE row_num = 1
        ORDER BY word_name;
    `;
    let result;
    try {
        result = await pool.query(execQuery, lessonToLevel[lesson]);
        console.log(result[0][number-1]['word_name']);
    } catch (err) { 
        console.error('データベース操作エラー:', err);
        res.status(500).send('データベース操作エラー');
    }

    console.log(result);
    console.log(result[0].length);
    
    const sentence = result[0][number-1]['sentence'];
    const word = result[0][number-1]['word_name'];
    const b64_data_path = path.join('./new_data_set/data/', result[0][number-1]['level'] + '_' + result[0][number-1]['type'], word, 'image' + result[0][number-1]['image_id'] + '.text');
    let text_data;
    try {
        text_data = await fs.readFile(b64_data_path, 'utf8');
    } catch (err) {
        console.error('ファイル読み込みエラー:', err);
        res.status(500).send('ファイル読み込みエラー');
    }
    
    let num = number;
    if (number > 5) {
        num = 0;
    }
    const wrong1 = result[0][num]['sentence'];
    const wrong2 = result[0][num+1]['sentence'];
    const wrong3 = result[0][num+2]['sentence'];

    const item_list = shuffleArray([sentence, wrong1, wrong2, wrong3]);
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        "ans":sentence,
        "item_list":item_list,
        "image": "data:image/png;base64," + text_data,
        "history": result[0][number-1]['image_id']
    });

});

app.post('/lesson-end', async (req, res) => {
    const user_id = req.status;
    if (user_id === false) {
        res.status(401).send('Token is not valid');
        return;
    }
    const lesson = req.body.lesson;
    const number = req.body.number;
    const query = `
        INSERT INTO user_lesson (user_id, word_name, image_id)
        VALUES (?, ?, ?)
    `;
});

/**
 *       index 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
 * list = [1, 3, ]
 * res.json({
 *      "ans":sentence,
 *      "item_list":item_list,
 *      "image": "data:image/png;base64," + text_data,
 *      "history": 番号を返します
 *  });
 * 
 * 
 */

app.post('/history', async (req, res) => {
    const user_id = req.status;
    const lesson = req.query.lesson;
    const history = req.body.history;

    const level = lessonToLevel[lesson][0];
    const type = lessonToLevel[lesson][1];

    if (user_id === false) {
        res.status(401).send('Token is not valid');
        return;
    }
    const execQuery = `
        SELECT word_name, sentence
        FROM lesson_data
        WHERE level = ? AND type = ?
        ORDER BY word_name;
    `;
    let result;
    try {
        result = await pool.query(execQuery, [level, type]);
    } catch (err) { 
        console.error('データベース操作エラー:', err);
        res.status(500).send('データベース操作エラー');
    }
    let history_list = [0]* 10;
    for (let i = 0; i < result[0].length; i++) {
        const word = result[0][i]['word_name'];
        const b64_data_path = path.join('./new_data_set/data/', result[0][i]['level'] + '_' + result[0][i]['type'], word, 'image' + history[i] + '.text');
        let text_data;
        try {
            text_data = await fs.readFile(b64_data_path, 'utf8');
        } catch (err) {
            console.error('ファイル読み込みエラー:', err);
            res.status(500).send('ファイル読み込みエラー');
        }
        history_list[i] = {
            title: "Lessson"+i+1,
            question: []
        };
    }

});

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
            const answer = await pool.query(
                'SELECT * FROM lesson_data WHERE word_name = ?',
                [q.name]
            );
            const data = answer[0];
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
                // console.log(image);
            } catch (error) {
                console.error('エラー:', error);
            }

            const image_data = "data:image/png;base64," + image;
            console.log(image_data);
            item_list.push(image_data);
    
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
app.get('/mysql',  async (req, res) => {
    try {
        // dotenv.config();
            // 例: クエリの実行
        // const test_query = `
        //     SELECT id, word_name, level, type, sentence, image_id
        //     FROM (
        //         SELECT id, word_name, level, type, sentence, image_id,
        //             ROW_NUMBER() OVER(PARTITION BY word_name ORDER BY RAND()) as row_num
        //         FROM lesson_data
        //         WHERE level = 'B1' AND type = 'noun'
        //     ) AS subquery
        //     WHERE row_num = 1;
        // `;

        const test_query = `
            SELECT id, word_name, level, type, sentence, image_id
            FROM lesson_data
            WHERE level = 'B1' AND type = 'noun'
        `;

        const result = await pool.query(test_query);
        console.log(result);
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
