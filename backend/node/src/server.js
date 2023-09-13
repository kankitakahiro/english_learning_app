const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
if (process.env.NODE_ENV !== "production") { // production is 本番環境
    dotenv.config();
    console.log("development");
} else{
    console.log("production");
}

const serviceAccount = {
    "type": process.env.apiKey,
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key,
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url,
    "universe_domain": process.env.universe_domain
}

app.use(express.static(path.join(__dirname, 'build')));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());

app.get('/test', (req, res) => {
    res.send('Hello World!');
});

// function mySql


app.post('/verifyToken', async (req, res) => {
    const idToken = req.body.token;
    // console.log(idToken);
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // decodedTokenにはUIDとその他のクレームが含まれます。
        console.log(decodedToken.uid); // これがユーザーのUIDです。
        res.header('Access-Control-Allow-Origin', '*');
        res.json(decodedToken);
        console.log("ok");

        // Mysqlの処理を書く

    } catch (error) {
        res.status(401).send('Token is not valid');
    }
});


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

