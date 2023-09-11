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
const mysql = require('promise-mysql');

// createUnixSocketPool initializes a Unix socket connection pool for
// a Cloud SQL instance of MySQL.
const createUnixSocketPool = async config => {
    // Note: Saving credentials in environment variables is convenient, but not
    // secure - consider a more secure solution such as
    // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
    // keep secrets safe.
    try {
    const pool = mysql.createPool({
        user: process.env.DB_USER, // e.g. 'my-db-user'
        password: process.env.DB_PASS, // e.g. 'my-db-password'
        database: process.env.DB_NAME, // e.g. 'my-database'
        socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
        // Specify additional properties here.
        ...config,
    });

    return pool;
    } catch (error) {
    console.error('Error creating database connection pool:', error);
    throw error;
    }
};

// この非同期関数内で createUnixSocketPool を呼び出すことができます
async function main() {
    const dbConfig = {
    // ここに接続構成を指定します。
    };

    const pool = await createUnixSocketPool(dbConfig);

    // ここでデータベースクエリを実行できます。
    try {
    const connection = await pool.getConnection();
    const rows = await connection.query('SELECT * FROM your_table_name');
    console.log(rows);
    } catch (error) {
    console.error('データベースクエリエラー:', error);
    } finally {
    if (connection) {
        connection.release(); // 接続を解放します。
    }
    }
}
    
    // main 関数を呼び出します
    main();

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

