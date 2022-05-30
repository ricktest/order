// 列出所有的 config, 做為預設值
module.exports = {
    serverName: 'my_web',
    address: '127.0.0.1',
    port: 3000,
    someProcessInterval: 5000,
    //.....其他自訂參數, 可依照專案需求提供執行階段的設定參數

    // 用於設定資料庫連線資料, 外層 key 值 db 可以自訂名稱, 內層的 key 值為固定
    // 資料庫連線資料通常會因為執行環境而改變，所以在 default.js 內不寫設定值, 改由 config.json 或是透過系統環境參數設定
    db:{
        // "host": "127.0.0.1",
        // "port": 3306,
        // "user": "",
        // "password": "",
        // "database": "database_name",
        // "connectionLimit": 100,
        // "show_clog": false
    },
    //.....
    log: {
        stdout_file: '',
        stderr_file: '',
        sql_dump_file: '',
        consoleDebug: true,  //允許 c_log 顯示並紀錄log
        consoleDebug_level: 150,  //允許紀錄的level
        rotate_time_secs: 3600, //滾表時間
        write_sql: true,  //寫入預設sql
        db_log: {
            "host": "",
            // "port": 3306,
            // "user": "",
            // "password": "",
            // "database": "database_name",
            // "connectionLimit": 100,
            // "show_clog": false
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
