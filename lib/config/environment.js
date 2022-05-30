const { toIntegerConfig, toBooleanConfig} = require('sakawa-core/utils/env-parser');

//定義可透過環境變數設定的 config, 會自訂專案縮寫做為參數名稱的前綴, 避免在同一台主機上的多個專案互相衝突

module.exports = {
    serverName: process.env.MY_SERVER_NAME,
    port: toIntegerConfig(process.env.MY_PORT),
    //......
    db: {
        host: process.env.MY_DB_HOST,
        user: process.env.MY_DB_USER,
        password: process.env.MY_DB_PSWD,
        database: process.env.MY_DB_DB,
        port: toIntegerConfig(process.env.MY_DB_PORT),
        connectionLimit: toIntegerConfig(process.env.MY_DB_CONNECTION_LIMIT),
        show_clog: toBooleanConfig(process.env.MY_DB_SHOW_CLOG)
    },
    log: {
        stdout_file: process.env.MY_LOG_STDOUT_FILE,
        stderr_file: process.env.MY_LOG_STDERR_FILE,
        sql_dump_file: process.env.MY_LOG_SQL_DUMP_FILE,
        consoleDebug: process.env.MY_LOG_CONSOLE_DEBUG,  //允許global_log顯示並紀錄log
        consoleDebug_level: process.env.MY_LOG_CONSOLE_DEBUG_LEVEL,  //允許紀錄的level
        rotate_time_secs: process.env.MY_LOG_ROTATE_TIME_SECS, //滾表時間
        write_sql: process.env.MY_LOG_WRITE_SQL,  //寫入預設sql
        db_log: {
            host: process.env.MY_LOG_DB_HOST,
            user: process.env.MY_LOG_DB_USER,
            password: process.env.MY_LOG_DB_PSWD,
            database: process.env.MY_LOG_DB_DB,
            port: toIntegerConfig(process.env.MY_LOG_DB_PORT),
            connectionLimit: toIntegerConfig(process.env.MY_LOG_DB_CONNECTION_LIMIT),
            show_clog: toBooleanConfig(process.env.MY_LOG_DB_SHOW_CLOG)
        },
        nlog_server: {
            server: process.env.MY_LOG_NLOG_SERVER,
            port: process.env.MY_LOG_NLOG_PORT,
            apiKey: process.env.MY_LOG_NLOG_API_KEY,
            sendTimer: process.env.MY_LOG_NLOG_SEND_TIMER,
            serverInfo: {
                server_name: process.env.MY_LOG_NLOG_SERVER_INFO_SERVER_NAME,
                ip: process.env.MY_LOG_NLOG_SERVER_INFO_IP,
                source: process.env.MY_LOG_NLOG_SERVER_INFO_SOURCE,
                cn: process.env.MY_LOG_NLOG_SERVER_INFO_CN,
            }
        },//使用外部nlog server
    },
    //....
}
