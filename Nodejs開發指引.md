# Nodejs 開發指引

## `sakawa-core`

內部通用程式庫會規劃建立 npm private package。

## 區分執行環境

Nodejs 生態下大部份的套件或框架會依賴系統環境參數 `NODE_ENV` 來區分當下的執行環境，一般使用：

* development: 開發環境，當沒有設定 `NODE_ENV` 時一般使用 development 做為預設的執行環境。
* test: 測試環境，指程式要跑測試案例的環境，與正式上線前的實測階段 staging 不同。
* production: 正式環境。

> 上線前實測試階段可依情況使用 production 或 development，要注意使用 production 環境下一些套件會關閉便於除錯的功能，例如 Express 的錯誤處理在 development 環境會回應完整的錯誤訊息，但在 production 環境下只會顯示 Internal Server Error。

程式內使用 `process.env` 取得系統參數，`process.env.NODE_ENV` 判定目前執行環境。

---

## 基本專案結構

```tex=
.project_root
+-- /bin 
+-- /lib 
    +-- /config
        +-- default.js
        +-- enum.js
        +-- environment.js
        +-- index.js
    +-- /controller
    +-- /middleware
    +-- /socket
    +-- routes.js
    +-- response.js
    +-- utils.js
+-- /logs
+-- /test
+-- .gitignore
+-- app.js
+-- config.json
+-- config.json.example
```

:::spoiler
`/bin`  
放置專案所需的批次處理、建置程序或是cli介面的執行檔，例如 `.sh`, `.bat`, `.js` 。

`/lib`  
放置專案內部所需的程式。

`/lib/config`  
放置專案提供外部設定的參數檔案，主要由資料夾下 `index.js` 處理參數注入且做為專案程式進入點除了外部模組外第一個要引入的專案內部模組，詳細說明請參照 **專案執行參數設計**。

`/controller`  
放置處理 Express 路由結點處理程式，詳細說明請參照 **Express 設計 - 路由結點控制 controller(handler)**。

`/middleware`  
放置 Express 中介層程式，詳細說明請參照 **Express 設計 - 中介層 middleware**。

`/socket`  
統整 socket 相關的程式，也可依功能模組建立自訂名稱的資料夾或 js。

`routers.js`  
統一在檔案內設定路由，詳細說明請參照 **Express 設計 - 路由 routing**。

`response.js`  
視專案規模，提取通用的回應格式統整為共用 function，尤其是錯誤訊息。

`utils.js`  
統整專案內經常會使用到的工具程式。

`/logs`  
專案有輸出log檔案的需求可以指定在此資料夾，且資料夾下要建立 `.gitignore` 檔案內容如下，讓資料夾可以加入版控，免除還要手動建立資料夾的問題。
```
#./logs/.gitignore
*
!.gitignore
```

`/test`
放置測試用途的程式，詳細說明請參照**測試案例設計**。

`.gitignore`
建議內容
```
# npm
# 依情況忽略 node_modules
node_modules/
npm-debug.log*
logs
*.log

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# ide
.idea/
.vscode/settings.json

# OS
.DS_Store
.Trashes
Icon
Thumbs.db
*.lnk

# config file
/config.json


```

`app.js`
程式進入點。

`config.json`
專案開發用的參數設定檔，不加入版控。

`config.json.example`
參數設定檔範例，需要加入版控方便維護團隊成員快速初始化專案。

:::

:::warning
> 其他專案所需的程式可以依功能模組在 `/lib` 資料夾下建立資料夾統整或提供單檔。 eg:/lib/service (放某個服務)
:::

---

## 專案執行參數設計

建立 `/lib/config` 資料夾統整專案所需的參數，建立檔案如下:

* `default.js`: 定義所有參數的預設值。
* `enum.js`: 定義專案內要提供列舉的參數。
* `environment.js`: 定義專案參數可透過系統環境參數設定的參數名稱。
* `index.js`: 處理合併所有參數以及初始化必要模組(例：設定 logger 層級)提供主程式運作參照。

並在專案根目錄建立 `config.json.example` 提供專案必要的參數設定範例。


### `default.js`

在檔案內定義專案所需的所有參數 key 值以及預設值。

:::spoiler 範例：
```javascript=
const {StatisticsGameType} = require("./enum");

// 列出所有的 config, 做為預設值
module.exports = {
    serverName: 'main_cache',
    port: 6666,
    //.....
    db:{
    },
    //.....
    log: {
        stdout_file: '',
        stderr_file: '',
        sql_dump_file: '',
        consoleDebug: true,  //允許global_log顯示並紀錄log
        consoleDebug_level: 150,  //允許紀錄的level
        rotate_time_secs: 3600, //滾表時間
        write_sql: true,  //寫入預設sql
        db_log: {
            host: '',
        },
        nlog_server: {
            server: ''
        }, //使用外部nlog server
    },
    status: {
        log_stst_to_clog : false, //輸出CPU資訊到console
        output_interval : 1000
    }
}

```
:::

:::warning
> 專案的參數至少要提供基本通用的參數：
> * port: 專案要使用的 port 號。
> * db: 資料庫連線資訊。
> * log: Logger 設定。
    > 其他的參數定義由開發人員針對各別專案自行決定。
    :::

### `enum.js`

檔案中定義專案內要提供列舉的參數。

:::spoiler 範例：
```javascript=
exports.Environment = {
    development: 'development',
    production: 'production',
    test: 'test'
};

exports.CacheStatus = {
    clean: 0,
    notClean: 1
};

exports.StatisticsGameType = {
    Baccarat: 'Baccarat',
    BlackZ: 'BlackZ',
    NiuNiu: 'NiuNiu',
};

```
:::

:::warning
> `enum.js` 定義列舉的目的是方便開發時取用對應資料。
:::

### `environment.js`

定義專案參數可透過系統環境參數設定的參數名稱。

:::spoiler 範例：

```javascript=
const { toIntegerConfig, toBooleanConfig} = require('sakawa-core/utils/env-parser');

//定義可透過環境變數設定的 config

module.exports = {
    serverName: process.env.AS_SERVER_NAME,
    port: toIntegerConfig(process.env.AS_PORT),
    //......
    db: {
        host: process.env.AS_DB_HOST,
        user: process.env.AS_DB_USER,
        password: process.env.AS_DB_PSWD,
        database: process.env.AS_DB_DB,
        port: toIntegerConfig(process.env.AS_DB_PORT),
        connectionLimit: toIntegerConfig(process.env.AS_DB_CONNECTION_LIMIT),
        show_clog: toBooleanConfig(process.env.AS_DB_SHOW_CLOG)
    },
    log: {
        stdout_file: process.env.AS_LOG_STDOUT_FILE,
        stderr_file: process.env.AS_LOG_STDERR_FILE,
        sql_dump_file: process.env.AS_LOG_SQL_DUMP_FILE,
        consoleDebug: process.env.AS_LOG_CONSOLE_DEBUG,  //允許global_log顯示並紀錄log
        consoleDebug_level: process.env.AS_LOG_CONSOLE_DEBUG_LEVEL,  //允許紀錄的level
        rotate_time_secs: process.env.AS_LOG_ROTATE_TIME_SECS, //滾表時間
        write_sql: process.env.AS_LOG_WRITE_SQL,  //寫入預設sql
        db_log: {
            host: process.env.AS_LOG_DB_HOST,
            user: process.env.AS_LOG_DB_USER,
            password: process.env.AS_LOG_DB_PSWD,
            database: process.env.AS_LOG_DB_DB,
            port: toIntegerConfig(process.env.AS_LOG_DB_PORT),
            connectionLimit: toIntegerConfig(process.env.AS_LOG_DB_CONNECTION_LIMIT),
            show_clog: toBooleanConfig(process.env.AS_LOG_DB_SHOW_CLOG)
        },
        nlog_server: {
            server: process.env.AS_LOG_NLOG_SERVER,
            port: process.env.AS_LOG_NLOG_PORT,
            apiKey: process.env.AS_LOG_NLOG_API_KEY,
            sendTimer: process.env.AS_LOG_NLOG_SEND_TIMER,
            serverInfo: {
                server_name: process.env.AS_LOG_NLOG_SERVER_INFO_SERVER_NAME,
                ip: process.env.AS_LOG_NLOG_SERVER_INFO_IP,
                source: process.env.AS_LOG_NLOG_SERVER_INFO_SOURCE,
                cn: process.env.AS_LOG_NLOG_SERVER_INFO_CN,
            }
        },//使用外部nlog server
    },
    //....
}
```
:::

:::warning
> 哪些參數要使用系統環境參數設定全由開發人員決定，但如果在 production 環境一律使用系統環境參數來設定專案參數時，是可以避免掉當誤傳 `config.json` 到 production 環境所造成的影響，因為 `/lib/config/environment.js` 在合併 config 的過程中是最後處理的，會覆蓋掉 `/lib/config/default.js` 和 `config.json` 的設定。
:::

### `index.js`

處理合併所有參數以及初始化必要模組(例：設定 logger 層級)提供主程式運作參照。

:::spoiler 範例：

```javascript=
const path = require("path");
const fs = require("fs");
const { merge, cloneDeep} = require('lodash')
const deepFreeze = require('sakawa-core/utils/deep-freeze');
const dbFactory = require("sakawa-core/database/database-factory");
const dbLogger = require('sakawa-core/database/db-logger');
const { Environment, CacheStatus, StatisticsGameType } = require('./enum');
const logger = require('../logger');


const appRootPath = path.resolve(__dirname, '../../');
const env = process.env.NODE_ENV || Environment.development;
const debugConfig = {
    debug: (env === Environment.development)
};

// 所有 config 都可以透過專案根目錄的 config.json 設定。
const configFilePath = path.resolve(appRootPath, process.env.CMD_CONFIG_FILE ||
    'config.json')
const fileConfig = fs.existsSync(configFilePath) ? require(configFilePath)[env] : undefined

let config = require('./default');
merge(config, debugConfig);
merge(config, fileConfig);
// 環境參數會覆寫 config.json 設定， merge 會略過 value 為 undefined 的 key 值，因為環境參數沒有設定對應參數時不用擔心會蓋過 config.json 的設定值。
merge(config, require('./environment'));

//初始化 logger
logger.consoleDebug_level = config.log.consoleDebug_level;
logger.consoleDebug = config.log.consoleDebug;

//依專案自訂
config.cacheStatus = CacheStatus;
config.StatisticsGameType = StatisticsGameType;

config.Environment = Environment;

config.appRootPath = appRootPath;

// make config readonly, config 值一律視為 const, 不能由外部異動
config = deepFreeze(config)

module.exports = config

```
:::

### `config.json.example`

在根目錄建立 `config.json.example` 提供專案必要的參數設定範例，檔案內依照執行環境提供參數設定：

:::spoiler 範例

```json=
{
  "test": {
    "port": 3000,
    "db": {
      "host": "127.0.0.1",
      "user": "",
      "password": "",
      "database": "api_crossover_test",
      "port": 3306,
      "connectionLimit": 100,
      "show_clog": false
    }
  },
  "development": {
    "port": 3000,
    "db": {
      "host": "127.0.0.1",
      "user": "",
      "password": "",
      "database": "",
      "port": 3306,
      "connectionLimit": 100,
      "show_clog": false
    },
    "log": {
      "db_log": {
        "host": "127.0.0.1",
        "user": "",
        "password": "",
        "database": "",
        "port": 3306,
        "connectionLimit": 100,
        "show_clog": false
      }
    }
  },
  "production": {
    "port": 6666,
    "db": {
      "host": "127.0.0.1",
      "user": "",
      "password": "",
      "database": "",
      "port": 3306,
      "connectionLimit": 100,
      "show_clog": false
    }
  }
}
```
:::

之後開發人員將專案 git clone 到本機後複制 `config.json.example` 為 `config.json` 就能夠進行本機佈署，而不影響到測試及正式站的設定。

### 自動複製 `config.json`

覺得手動複制檔案太不工程師的話可以建立檔案 `/bin/setup` 專案初始化 shellscript:
:::spoiler
```shell=
#!/bin/bash

set -e

# run command at repo root
CURRENT_PATH=$PWD
if [ -d .git ]; then
  cd "$(git rev-parse --show-toplevel)"
fi

if ! type npm > /dev/null
then
  cat << EOF
npm is not installed, please install Node.js and npm.
Read more on Node.js official website: https://nodejs.org
Setup will not be run
EOF
  exit 0
fi

echo "copy config files"
if [ ! -f config.json ]; then
  cp config.json.example config.json
fi

echo "install packages"
npm install

cat << EOF


Edit the following config file to setup Account server and client.

* config.json           -- Project config

EOF

# change directory back
cd "$CURRENT_PATH"

```
:::

---

## Express 設計

### 建立 `app.js`

```javascript=
const config = require('./lib/config');
const express = require('express');
const {createHttpServer} = require('sakawa-core/utils/express-utils');
const someMiddleware = require('./lib/middleware/some-middleware');

const app = express();
//取得 httpServer 實體
const server = createHttpServer(app);

//關閉 response header 顯示 x-powered-by
if (!config.debug) {
    app.disable('x-powered-by');
}

//設定 middleware
app.use(middleware);

//設定 router module 提供 rounting 與 controller(handler)
app.use(require('./lib/routers').router);

//設置完必要的 middleware 和 router 後再設定預設 routing handler
app.use(function(req, res) {
    res.status(404);
});

//處理初始化設定模組

//設定 interval, timeout 要記錄 id，方便平緩的關閉服務，建議建立獨立模組開始、關閉 interval, timeout
let intervalId = setInterval(() => {
    //.....
}, config.someProcessInterval)


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

//處理 process 事件

```

:::warning
> log 工具請依實際狀況使用對應的執行方式。
:::

### 中介層 middleware

將通用性較高的 middleware 統一放在 `/lib/middleware` 資料夾下。

`/lib/middleware/api_key_check.js`
```javascript=
const config = require('../config');
const {clog} = require('../../sakawa-core/hdl_logger');

function apiKey_check(req, res, next) {
    const { apiKey } = req.body;
    let key_check = false;
    if (apiKey) {
        if (apiKey == config.api_key) {
            return next();
        } else {
            clog('keyFail -> no match', 50);
            return res.json({ 'status': '401', 'msg': 'keyFail' });
        }
    } else {
        clog('keyFail -> no key', 50);
        return res.json({ 'status': '400', 'msg': 'keyFail' });
    }
}

module.exports = apiKey_check;
```

> 詳細文件可參考[官網 - writing-middleware](https://expressjs.com/en/guide/writing-middleware.html)


### 路由 routing

建立 `/lib/routers.js` 設定路由。

```javascript=
const { Router } = require('express');
const someController = require('./controller/some')
const appRouter = Router();

appRouter.post('/', someController.index);


exports.router = appRouter;
```

> 詳細文件可參考[官網 - routing](https://expressjs.com/en/guide/routing.html)。

#### 路由路徑

路由路徑可以是 string, string patterns, 或是正則表達式。

路由設定範例
:::spoiler
```javascript=
/*
 * string
 */ 
appRouter.get('/welcome', (req, res) => {
    res.send('welcome')
});

/*
 * string patterns
 */
// 表示?前的字元b為可有可無但最多出現一次，所以這個路由會對應到 /acd 或是 /abcd
appRouter.get('/ab?cd', (req, res) => {
    res.send('ab?cd');
});
// 表示+前的字元b至少會出現一次可重複出現，所以這個路由會對應到 /abcd, /abbcd, /abbbcd 以此類推。
appRouter.get('/ab+cd', (req, res) => {
    res.send('ab+cd');
});
// 表示*可以符合任何字元且可重複出現，所以這個路由會對應到 /abcd, /abxcd, /abRANDOMcd, /ab123cd 以此類推。
appRouter.get('/ab*cd', (req, res) => {
    res.send('ab*cd');
});
// 表示?前的字元群組(cd)可有可無但最多出現一次，所以這個路由會對應到 /abe 或是 /abcde。
appRouter.get('/ab(cd)?e', (req, res) => {
    res.send('/ab(cd)?e');
});

/*
 * 正則表達式
 */
// 表示包含有a的任何路徑皆符合這個路由
appRouter.get(/a/, (req, res) => {
    res.send('/a/');
});

//「.」表示任1單一字元，「*」表示前方字元可出現0～多次，「$」表示路由路徑結尾，綜合表示為任何fly結尾的路徑皆符合這個路由
// fly, butterfly, dragonfly 有符合
// butterflyman, dragonflyman 不符合
appRouter.get(/.*fly$/, (req, res) => {
    res.send('/.*fly$/');
});
```
:::


> 正則表達式可利用各式各樣的線上工具測試驗證
> * [https://regex101.com/](https://regex101.com/)
> * [https://regexr.com/](https://regexr.com/)
> * [https://tw.piliapp.com/regex-tester/#javascript](https://tw.piliapp.com/regex-tester/#javascript) 中文介面，但範例與說明少。

#### 路由參數

路由參數可以將路徑的一部份做為傳入參數的一部份，例如

```
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }
```

要定義路由參數只要簡單的在路徑由指定參數

```javascript=

app.get('/users/:userId/books/:bookId', (req, res) => {
    res.send(req.params.userId);
    res.send(req.params.bookId);
})

```

> 參數名稱只能設定為文字字元[A-Za-z0-9_]

使用破折號「-」與點「.」會視為一般文字進行解析，所以可以搭配路由參數達到有用的目的。

```javascript=
// /flights/LAX-SFO
app.get('/flights/:from-:to', (req, res) => {
    // params: {"from": "LAX", "to": "SFO"}
    res.send(req.params.from);
    res.send(req.params.to);
});


// /plantae/Prunus.persica
app.get('/plantae/:genus-:species', (req, res) => {
    // params: { "genus": "Prunus", "species": "persica" }
    res.send(req.params.genus);
    res.send(req.params.species);
})
```

如果要對路由參數有更精確的判定，可以在路由參數後方附加正則表達式在括號中。

```javascript=

//加上正則表達式可以更精確判定 userId 為數字時才符合路由
app.get('/user/:userId(\\d+)', (req, res) => {
    res.send(req.params.userId);
});
```

> 目前 express 4.x 「*」在路由參數中的正則表達式無法正確的像一般使用運作，可以使用「{0,}」 來替代使用「*」的需求，這個問題會在 express 5 中修正。

### 路由結點控制 controller(handler)

放置路由分配後的結點要處理的邏輯控制程式，將程式區塊依照功能大方向分割出多個獨立檔案模組，方便後續維護。

`/lib/controller/user`
```javascript=
function getInfo(req, res) {
    
}
exports.getInfo = getInfo;
```

### next 機制

Express 執行的邏輯是在一連串的中介層函式運行，中介層函式包含：
* app.METHOD ,router.METHOD(get, post, put, patch, delete), app.all, router.all 第2個傳入的函式。
* app.use, router.use 傳入的函式。

且在設定時都可以一次傳入多個中介層函式。

一般的中介層函式會接收3個參數 request object(`req`), response object(`res`), next middleware function(`next`)，`next` 函式就是用來確保當次的 request 會交由下一個中介層函式繼續處理。

在呼叫 `next()` 後要注意同一中介層函式內後面的程式會不會被執行，例如：

```javascript=
app.get('/', (req, res, next) => {
    if (req.body.id !== undefined) {
        next();
    }
    //這裡有問題
    res.json({status: 1});
});
```

要加上 `return`

```javascript=
app.get('/', (req, res, next) => {
    if (req.body.id !== undefined) {
        return next();
    }
    
    res.json({status: 1});
});
```
