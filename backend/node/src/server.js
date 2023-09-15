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
app.use( async (req, res, next) => {
    try {
        const idToken = req.headers.authorization;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.status = decodedToken.uid;
    } catch (error) {
        console.log(error);
        req.status = false;
    }
    next();
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

        // res.header('Access-Control-Allow-Origin', '*'); // for development

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

    

    if (lesson === undefined || number === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    const level = lessonToLevel[lesson][0];
    const type = lessonToLevel[lesson][1];

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
    
    
    let sentence;
    let text_data;
    try {
        sentence = result[0][number-1]['sentence'];
        const word = result[0][number-1]['word_name'];
        const b64_data_path = path.join('./new_data_set/data/', result[0][number-1]['level'] + '_' + result[0][number-1]['type'], word, 'image' + result[0][number-1]['image_id'] + '.text');
    
        text_data = await fs.readFile(b64_data_path, 'utf8');
    } catch (err) {
        sentence = "エラー..., Sorry";
        text_data = ["..."];
        console.error('ファイル読み込みエラー:', err);
        // res.status(500).send('ファイル読み込みエラー');
    }
    
    let num = number;
    if (number > 5) {
        num = 0;
    }

    let wrong1; result[0][num]['sentence'];
    let wrong2; result[0][num+1]['sentence'];
    let wrong3; result[0][num+2]['sentence'];
    try {
        wrong1 = result[0][num]['sentence'];
        wrong2 = result[0][num+1]['sentence'];
        wrong3 = result[0][num+2]['sentence'];
    } catch (err) {
        console.error('エラー', err);
        wrong1 = "エラー..., Sorry";
        wrong2 = "エラー..., Sorry";
        wrong3 = "エラー..., Sorry";
    }
    

    let item_list;
    try {
        item_list = shuffleArray([sentence, wrong1, wrong2, wrong3]);
    } catch (err) {
        console.error('エラー', err);
        item_list = [sentence, wrong1, wrong2, wrong3];
    }
    
    // res.header('Access-Control-Allow-Origin', '*');
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

app.get('/all-words', async (req, res) => {
    // const user_id = req.status;
    // const lesson = req.query.lesson;
    // const history = req.body.history;

    // if (lesson === undefined || history === undefined) {
    //     res.status(400).send('Bad Request');
    //     return;
    // }

    // const level = lessonToLevel[lesson][0];
    // const type = lessonToLevel[lesson][1];

    // if (user_id === false) {
    //     res.status(401).send('Token is not valid');
    //     return;
    // }
    const execQuery = `
        SELECT id, word_name, level, type, sentence, image_id
        FROM (
            SELECT id, word_name, level, type, sentence, image_id,
                ROW_NUMBER() OVER(PARTITION BY word_name ORDER BY RAND()) as row_num
            FROM lesson_data
        ) AS subquery
        WHERE row_num = 1
        ORDER BY word_name;
    `;
    let result;
    try {
        result = await pool.query(execQuery);
    } catch (err) { 
        console.error('データベース操作エラー:', err);
        res.status(500).send('データベース操作エラー');
    }

    // console.log(result.length);
    // return;
    let history_list = [];
    let tmp = 0;
    for (let i = 0; i < 5; i++) {
        history_list.push({
            "title": "Lesson" + (i + 1),
            "questions": []
        });
        try {
            for (let j = 0; j < 10; j++) {
                let b64_data_path;
                let word;
                try {
                    word = result[0][tmp]['word_name'];
                    // console.log(word);
                    // return;
                    b64_data_path = path.join('./new_data_set/data/', result[0][tmp]['level'] + '_' + result[0][tmp]['type'], word, 'image' + result[0][tmp]['image_id'] + '.text');
                    // console.log("---------");
                    let text_data = await fs.readFile(b64_data_path, 'utf8');
                    // console.log(text_data);
                    // console.log(tmp);
                    tmp++;   
                    if (j == 0){
                        
                        if (j == 0) {
                            history_list[i].questions = [{ word: word, image: "data:image/png;base64," + text_data }];
                        } else {
                            history_list[i].questions.push({ word: word, image: "data:image/png;base64," + text_data });
                        }
                        // console.log("_______________");
                        // console.log("_______________");
                        // console.log("_______________");
                        // console.log(history_list);
                        // console.log("_______________");
                    }else {
                        history_list[i]['questions'].append({'word': word, "image": "data:image/png;base64," + text_data})
                    }
                    // console.log(history_list[i]);
                    

                } catch (err) {
                    console.error('ファイル読み込みエラー:', err);
                    // break
                    // res.status(500).send('ファイル読み込みエラー');
                }
                // console.log(b64_data_path);    
            }
        } catch (err) {
            // break
            console.error('ファイル読み込みエラー:', err);
            // break
            // res.status(500).send('ファイル読み込みエラー');
        }
    }
    
    // console.log(history_list);
    res.json({
        history: history_list
    });
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

app.get('/ilesson-test', async (req, res) => {
    console.log("tlesson");
    // req.queryでクエリパラメータにlessonと単語番号が入っている
    // 例: http://localhost:8080/lesson-test?lesson=1&number=1
    const lesson = req.query.lesson;
    const number = parseInt(req.query.number);

    console.log(lesson);

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

    // console.log(result);
    // console.log(result[0].length);

    let text_data;
    let sentence;
    try {
        sentence = result[0][number-1]['sentence'];
        const word = result[0][number-1]['word_name'];
        const b64_data_path = path.join('./new_data_set/data/', result[0][number-1]['level'] + '_' + result[0][number-1]['type'], word, 'image' + result[0][number-1]['image_id'] + '.text');

        text_data = await fs.readFile(b64_data_path, 'utf8');
    } catch (err) {
        sentence = "エラー..., Sorry";
        text_data = ["..."];
        console.error('ファイル読み込みエラー:', err);
        // res.status(500).send('ファイル読み込みエラー');
    }
    
    let num = number;
    if (number > 5) {
        num = 0;
    }

    let wrong1_text_data;
    try {
        const wrong1_word = result[0][num+2]['word_name'];
        const wrong1_b64_data_path = path.join('./new_data_set/data/', result[0][num+2]['level'] + '_' + result[0][num+2]['type'], wrong1_word, 'image' + result[0][num+2]['image_id'] + '.text');
    
        wrong1_text_data = await fs.readFile(wrong1_b64_data_path, 'utf8');
    } catch (err) {
        wrong1_text_data = ["..."];
        console.error('ファイル読み込みエラー:', err);
        // res.status(500).send('ファイル読み込みエラー');
    }
    let wrong2_text_data;
    
    try {
        const wrong2_word = result[0][num+3]['word_name'];
        const wrong2_b64_data_path = path.join('./new_data_set/data/', result[0][num+3]['level'] + '_' + result[0][num+3]['type'], wrong2_word, 'image' + result[0][num+3]['image_id'] + '.text');
    
        wrong2_text_data = await fs.readFile(wrong2_b64_data_path, 'utf8');
    } catch (err) {
        wrong2_text_data = ["..."];
        console.error('ファイル読み込みエラー:', err);
        // res.status(500).send('ファイル読み込みエラー');
    }
    
    let wrong3_text_data;
    try {
        const wrong3_word = result[0][num+4]['word_name'];
        const wrong3_b64_data_path = path.join('./new_data_set/data/', result[0][num+4]['level'] + '_' + result[0][num+4]['type'], wrong3_word, 'image' + result[0][num+4]['image_id'] + '.text');
        wrong3_text_data = await fs.readFile(wrong3_b64_data_path, 'utf8');
    } catch (err) {
        wrong3_text_data = ["..."];
        console.error('ファイル読み込みエラー:', err);
        // res.status(500).send('ファイル読み込みエラー');
    }
    
    const item_list = shuffleArray(["0data:image/png;base64," + text_data, "1data:image/png;base64," + wrong1_text_data, "2data:image/png;base64," + wrong2_text_data, "3data:image/png;base64," + wrong3_text_data]);
    let ans = 0;
    for (let i = 0 ;i < 4;i++) {
        if (item_list[i][0] == "0"){
            ans = i;
        }
        item_list[i] = item_list[i].slice(1);
    }
    // console.log(ans);
    // console.log(sentence);
    // console.log(item_list);
    
    console.log("_______________");
    // console.log(ansWords);
    // console.log(item_list.length);
    console.log(ans);
    console.log("_______________");
    // console.log(item_list[0]);

    // res.header('Access-Control-Allow-Origin', '*');
    res.json({
        "ans": ans,
        "images":item_list,
        "word": sentence,
        "history": result[0][number-1]['image_id']
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
