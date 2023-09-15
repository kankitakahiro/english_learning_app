var count = 0;
// データベースに新しくデータを追加するエンドポイントです
// このエンドポイントは、アプリの開発時にのみ使用します
app.get('/development-mysl/init-table', async(req, res) => {
    const table_name = req.query.table_name;

    if (table_name === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    if (table_name !== 'lesson_data') {
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



// データベースに新しくデータを追加するエンドポイントです
// このエンドポイントは、アプリの開発時にのみ使用します
// データはローカルのファイルから読み込みます
app.get('/development-mysl/add-data', async (req, res) => {
          const table_name = req.query.table_name;
      
          if (table_name === undefined) {
              res.status(400).send('Bad Request');
              return;
          }
      
          if (table_name !== 'lesson_data') {
              res.status(400).send('Bad Request');
              return;
          }
      
          if (count !== 0) {
              res.status(400).send('Bad Request');
              return;
          }
          return;
      
          count ++;
          console.log(count);
      
          let dataJson; // データを格納する
          const query = `INSERT INTO ${table_name} SET ?`; // データを追加するクエリ
      
          // ローカルファイルからデータを読み込む
          const initialPath = './new_data_set';
          const data_file_path = initialPath + '/sentence';
          const directoryPath = path.join(data_file_path);
      
          // ./sentence直下のlevel別のディレクトリを取得
          let file_set = await fs.readdir(directoryPath);
          // file_set = ['B1_noun'];
      
          res.status(200).send('OK');
          // console.log(typeof(file_set));
          let total = 0;
          // レベル別ディレクトリの中のwordテキストファイルを取得
          for (let each_level of file_set) {
              const level_type = each_level.split('_');
              const level = level_type[0];
              const type = level_type[1];
              // console.log(each_level);
              const level_directoryPath = path.join(data_file_path, each_level);
              text_list = await fs.readdir(level_directoryPath);
              // console.log(text_list);
              // 各テキストファイルの中身と名前を取得し、images, dataの中からも取得する
              for (let each_text of text_list) {
                  word_name = each_text.replace('.text', '');
                  // console.log(word_name);
                  const text_directoryPath = path.join(level_directoryPath, each_text);
                  const text_data = await fs.readFile(text_directoryPath, 'utf8');
                  const context = text_data.split('\n');
                  // console.log(context);
                  // 各文章について, dataの中からも取得する
                  for (let i = 1; i < context.length; i++) {
                      // id | word_name | level | type | sentence | image_id |
                      console.log(word_name, level, type, context[i-1], 'image_id'+(i));
                      dataJson = {
                          word_name: word_name,
                          level: level,
                          type: type,
                          sentence: context[i-1],
                          image_id: i
                      };
                      console.log(dataJson);
                      // データを追加する
                      // setInterval(function () {
                      //     // 処理
                      //     // pool.query(query, dataJson, (err, results) => {
                      //     //     if (err) throw err;
                      //     //     console.log(results);
                      //     // });
                      //     console.log(dataJson);
                      // }, 1000);
                      total ++;
                      pool.query(query, dataJson, (err, results) => {
                          if (err) throw err;
                              console.log(results);
                      });
                      
                  }
              }
          }
          console.log(total);
          
          return;
      
          
      });
      

      // アプリ開始時に確認する.
const readline = require('readline');
const { create } = require('domain');
const { table } = require('console');

app.get('/addsql', async (req, res) => {
    fs.readdir('./text', async (err, files) => {
        if (err) {
        console.log(err);
        res.status(500).send('Internal Server Error 1');
        return;
        }
        
        // .txt ファイルだけをフィルタリング
        const textFiles = files.filter(file => path.extname(file) === '.text');
    
        for (const elem of textFiles) {
        let lesson = 'error';
        if (/.*B1.*/.test(elem)) {
            lesson = 1;
        } else if (/.*B2.*/.test(elem)) {
            lesson = 2;
        } else if (/.*C1.*/.test(elem)) {
            lesson = 3;
        } else if (/.*C2.*/.test(elem)) {
            lesson = 4;
        }
        console.log(lesson);
        const stream = fs.createReadStream('./text/' + elem, 'utf8');
        const namelist = {};
    
        const rl = readline.createInterface({
            input: stream,
            output: process.stdout,
            terminal: false
        });
    
        rl.on('line', async (data) => {
            const processedData = data.replace(/\n/g, '').replace(/ /g, '_').replace(/\./g, '').replace(/'/g, '');
            // ここで非同期処理を行いたい場合、awaitを使用してください。
            // 例: const result = await someAsyncFunction(processedData);
            namelist[data] = processedData;
        });
    
        await new Promise((resolve) => {
            rl.on('close', async () => {
                    // ファイルの読み込みが完了した後に行う処理をここに記述
                    // console.log(namelist); // namelistに処理結果が格納されていると仮定しています

                try {
                    const files = await fs.promises.readdir('./b64_data'); // 非同期でディレクトリを読み込み
                    // .txt ファイルだけをフィルタリング
                    const textFiles = files.filter(file => path.extname(file) === '.text');
                    
                    // ここで textFiles の処理を続けできます
                    // 例: textFiles.forEach(...)
                    // console.log(textFiles)
                    Object.keys(namelist).forEach(function (word) {
                        textFiles.forEach(function (value) {
                            if (!value.indexOf(namelist[word])) {                  
                                // 文章と絵が入っているファイルを結びつけることができた。
                                
                                /**
                                *  table
                                * ___________________________
                                * id | word | image | lesson |
                                * ---------------------------
                                */
                                // console.log(word,lesson,"data:image/png;base64," + image_data);
                                
                                let flag;
                                try {
                                    dotenv.config();
                                    // クエリを実行
                                    pool.query("SELECT * FROM question where lesson = ?", [lesson], (err, database) => {
                                        database.forEach(function(each_data){
                                            if (each_data.image === value){
                                                flag = 'dup'
                                            }
                                        });
                                        if (!(flag === 'dup')){
                                            pool.query('INSERT IGNORE INTO question(word,image,lesson) VALUES(?,?,?)',[word,value,lesson],function(error, response) {
                                                if(error) throw error;
                                                    console.log(word,value,lesson);
                                            });
                                        }
                                    });
                                } catch (err) {
                                    console.error('データベース操作エラー:', err);
                                    res.status(500).send('データベース操作エラー');
                                }
  
                            }
                        });
                    });
                } catch (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error 2');
                }

        
    
            resolve(); // Promiseを解決して次のファイルの処理を開始
            });
        });
        }
        
        console.log('All files processed.');
    });
});
