const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'build')));

/**
 *  table
 * ___________________________
 * id | word | image | lesson |
 * ---------------------------
 */

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
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

    // mysqlからデータを取得する
    // *****************
// PostgreSQL connect info
const mysql = require('mysql');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};
// ルートハンドラーの定義
app.get('/', (req, res) => {
    // Cloud SQL データベースに接続
    const connection = mysql.createConnection(dbConfig);

    // 接続を開始
    connection.connect((err) => {
        if (err) {
            console.error('データベースへの接続エラー:', err);
            res.status(500).send('データベースへの接続エラー');
            return;
        }

        // クエリを実行
        connection.query('SELECT * FROM question', (error, results, fields) => {
            // クエリ実行後、接続を終了
            connection.end();

            if (error) {
                console.error('クエリエラー:', error);
                res.status(500).send('クエリエラー');
                return;
            }

            // クエリの結果をレスポンスとして返す
            res.json(results);
        });
    });
});
    // *****************

    // 現在のディレクトリの位置をconsole.logで確認
    // console.log(__dirname);
    // fs.readdir('./', (err, files) => {
    //     if (err) {
    //         console.log(err);
    //         res.status(500).send('Internal Server Error 10');
    //         return;
    //     }
    //     console.log('-----------');
    //     console.log(files);
    //     console.log('-----------');
    // });
    
    
    // const data_path = "/Users/yamamotoyuta/Desktop/Hack U/code/english_learning_app/backend/node/b64_data";

    fs.readdir('./b64_data', (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error 1');
            return;
        }

        
        let image_data;
        // .txt ファイルだけをフィルタリング
        const textFiles = files.filter(file => path.extname(file) === '.text');
        
        // ランダムな .txt ファイルを選ぶ
        const randomFile = textFiles[Math.floor(Math.random() * textFiles.length)];
        

        // ファイルの内容を読み取る
        
        fs.readFile(path.join('./b64_data', randomFile), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Internal Server Error 2');
                return;
            }
            image_data = data;

            // ans = 'apple';
            // item_list = ['apple', 'banana', 'peach', 'grape'] // シャッフル

            // console.log(image_data);
            // base64形式で返す
            res.header('Access-Control-Allow-Origin', '*');
            res.json({
                "id": 1,
                "answer": "hogehoge",
                "wronge1": "apple",
                "wronge2": "apple",
                "wronge3": "apple",
                "image": "data:image/png;base64,"+image_data,
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

