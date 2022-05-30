const config = require('./config');
const dbFactory = require('sakawa-core/database/database-factory');

//第2個參數為自訂 key 值, 選填, 沒有設定時會預設以 default 做為 key 值
const myDb = dbFactory.addDatabase(config.db, 'myDb');

//其他檔案可以透過 require('./lib/my-db') 取得 SakawaMysql 實體
//或是透過 dbFactory.getDatabase('myDb') 取得, 沒有指定 key 時會以預設 default 做為 key 取得 SakawaMysql 實體

module.exports = myDb;
