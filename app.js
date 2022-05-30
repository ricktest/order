const express = require('express');
const session = require('express-session')
const config = require('./lib/config');
const logger = require('sakawa-core/hdl-logger');
const {orig_console_log, clog, overwriteConsoleLog} = logger;
const dbLogger = require('sakawa-core/database/db-logger');
const osInfo = require('sakawa-core/os-info');
const {createHttpServer} = require('sakawa-core/utils/express-utils');

//初始化 dbLogger, 依專案需求設定
 dbLogger.serverName = config.server_name;
 dbLogger.initSkwMysql(config.log.db_log);
// 初始化 SakawaMysql 操作記錄使用的 dbLogger, 依專案需求設定
 logger.db_callback = dbLogger.write_server_ap_log.bind(dbLogger);
 
//覆寫 console.log
overwriteConsoleLog(3, false);

logger.start(config.log);
console.log( logger.db_callback);
// 初始化 db 連線, 第一次初始化只能透過 require 檔案進行, 後續可以透過 require('sakawa-core/database/database-factory').getDatabase(key) 取得。
//const myDb = require('./lib/my-db');

const myMiddleware = require('./lib/middleware/my-middleware');

const app = express();
//取得 httpServer 實體
const server = createHttpServer(app);

//關閉 response header 顯示 x-powered-by
if (!config.debug) {
    app.disable('x-powered-by');
}

//其他 express 設定 請參照 https://expressjs.com/

//設定 middleware
app.use(myMiddleware);
app.use(express.json());
app.use(session({
    secret: 'mySecret',
    name: 'user', // optional
    saveUninitialized: false,
    resave: true, 
}));
//設定 router module 提供 rounting 與 controller(handler)
app.use(require('./lib/routes').router);

//設置完必要的 middleware 和 router 後再設定預設 routing handler
app.use(function(req, res) {
    res.status(404);
});

//處理初始化設定模組

//設定 interval, timeout 要記錄 id，方便平緩的關閉服務，建議建立獨立模組開始、關閉 interval, timeout
let intervalId = setInterval(() => {
    //.....
    //clog('interval log:'+Date.now());
}, config.someProcessInterval)


//啟用輪詢 timer 自動更新 os-info
osInfo.startUpdate();
//停止輪詢 timer
//osInfo.stopUpdate();

// 當 os-info 更新時會觸發 update 事件，可自訂後續處理
osInfo.on('update', (system_status, online_stst) => {
    //clog('osInfoUpdate system_status:'+JSON.stringify(system_status));
    //clog('osInfoUpdate online_stst:'+JSON.stringify(online_stst));
});


//啟用 http 服務監聽指定 port 號。
function startListen() {
    function listenCallback() {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.log(`server listening on ${bind}`);

        //處理服務啟動後要做的更新，例如 account server 執行 set_sql_ongood
    }

    //保留處理是否需要指定 host
    server.listen(config.port, listenCallback);
}

async function initFunction() {
    //服務啟用前要先完成的程式，例如 account server 要由資料庫載入帳號資料提供快取服務。
    //使用 async或 callback 確保區塊完成後才會啟用服務
}

initFunction().then(() => {
    startListen();
}).catch((error) => {
    //提示 init 錯誤
    console.error(`initFunction error`);
    console.error(error);
    console.error(`Process will exit now`);
    process.exit(1);
});

module.exports = app;
