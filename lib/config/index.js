const path = require("path");
const fs = require("fs");
const { merge } = require('lodash')
const deepFreeze = require('sakawa-core/utils/deep-freeze');
const { Environment } = require('./enum');
const logger = require('sakawa-core/hdl-logger');

// 依照實際資料夾結構, 定義專案的根目錄
const appRootPath = path.resolve(__dirname, '../..');
const env = process.env.NODE_ENV || Environment.development;
const debugConfig = {
    debug: (env === Environment.development)
};

// 所有 config 都可以透過專案根目錄的 config.json 設定。
const configFilePath = path.resolve(appRootPath, process.env.MY_CONFIG_FILE ||
    'config.json')
const fileConfig = fs.existsSync(configFilePath) ? require(configFilePath)[env] : undefined

let config = require('./default');

merge(config, debugConfig);
merge(config, fileConfig);
// 環境參數會覆寫 config.json 設定， merge 會略過 value 為 undefined 的 key 值，因為環境參數沒有設定對應參數時不用擔心會蓋過 config.json 的設定值。
merge(config, require('./environment'));

//初始化 logger 設定
logger.consoleDebug_level = config.log.consoleDebug_level;
logger.consoleDebug = config.log.consoleDebug;

//依專案自訂

config.Environment = Environment;

config.appRootPath = appRootPath;

// make config readonly, config 值一律視為 const, 不能由外部異動
config = deepFreeze(config)

module.exports = config
