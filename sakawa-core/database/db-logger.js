const os = require('os');
const mysql = require("mysql2");
const dbFactory = require("./database-factory");

const pArgsSymbol = Symbol('dblogSymbol');

const createCallback = () => {
    return (status, results, fields) => {}
}

class DbLogger{
    #serverName = os.hostname();

    /**
     *
     * @param {null|SakawaMysql} skwMysql
     */
    constructor(skwMysql = null) {
        this[pArgsSymbol] = {
            skwMysql: skwMysql,
        };
    }

    set serverName(value) {
        if (!value) value = os.hostname();
        this.#serverName = value;
    }

    get serverName() {
        return this.#serverName;
    }

    /**
     *
     * @return {null|SakawaMysql}
     */
    get skwMysql() {
        return this[pArgsSymbol].skwMysql;
    }

    /**
     *
     * @param {obj} dbConfig
     * @param {string} dbKey
     */
    initSkwMysql(dbConfig, dbKey = 'db_log') {
        if (typeof dbConfig === 'object') {
            if (dbConfig.host) {
                this[pArgsSymbol].skwMysql = dbFactory.addDatabase(dbConfig, dbKey);
            }
        }
    }

    unloadSkwMysql() {
        this[pArgsSymbol].skwMysql = null;
        return this;
    }

    endSkwMysql(cb) {
        if (this.skwMysql) {
            this.skwMysql.pool.end((err) => {
                if (typeof cb === 'function') cb(err);
            });
            return;
        }

        if (typeof cb === 'function') {
            cb();
        }
    }

    write_server_ap_log(c_this, msg, level = 100, type = 'console.log') {
        if (this.skwMysql) {
            const t_callback = createCallback();
            let dd = new Date();
            let data_struct = {
                'createtime': dd.toISOString().slice(0, 19).replace('T', ' '),
                'server_name': this.serverName,
                'server_time': dd.toISOString().slice(0, 19).replace('T', ' '),
                'type': type,
                'uid': ((typeof c_this.uid) === 'undefined') ? "NA" : c_this.uid,
                'info': msg,
                'args': '',
                'datadump': '',
                'ip': ((typeof c_this.ip) === 'undefined') ? "NA" : c_this.ip,
                'room_id': ((typeof c_this.roomid) === 'undefined') ? "NA" : c_this.roomid,
            };
            this.skwMysql.m_sql_insert(
                'server_ap_log',
                data_struct,
                t_callback,
                false
            );
        }
    }

    write_query_log(c_this, table, sql, qerr, results, type) {
        if (this.skwMysql) {
            const t_callback = createCallback();
            let dd = new Date();
            try {
                let data_struct = {
                    'createtime': dd.toISOString().slice(0, 19).replace('T', ' '),
                    'server_name': os.hostname(),
                    'server_time': dd.toISOString().slice(0, 19).replace('T', ' '),
                    'type': type,
                    'uid': ((typeof c_this.uid) === 'undefined') ? "NA" : c_this.uid,
                    'table': table,
                    'query': sql,
                    'datadump': JSON.stringify(results),
                    'error': JSON.stringify(qerr),
                    'ip': ((typeof c_this.ip) === 'undefined') ? "NA" : c_this.ip,
                    'room_id': ((typeof c_this.roomid) === 'undefined') ? "NA" : c_this.roomid,
                };

                this.skwMysql.m_sql_insert(
                    'query_log',
                    data_struct,
                    t_callback,
                    false,
                );
            } catch (err) {
                console.log(type);
                console.log(table);
                console.log(err.name);
            }

        }
    }

    get_query_log(data_id, callback) {
        console.log('mysql.get_query_log : ' + data_id);
        if (typeof callback !== 'function') callback = createCallback();
        if (!this.skwMysql) {
            callback(false);
            return;
        }

        if (data_id === null) {
            callback(false);
            return;
        }

        let sql = 'SELECT * FROM query_log WHERE id = ' + mysql.escape(data_id) + '';
        console.log('mysql.get_query_log_sql : ' + sql);

        this.skwMysql.query(sql, function (error, results, fields) {
            if (error) {
                callback(false, results, fields);
                //throw error;
                console.log('get_query_log throw error : ' + error, 50);
            }
            else {
                console.log('query_log result : len=' + results.length, 100);
                if (results.length > 0) {
                    callback(true, results, fields);
                }
                else {
                    callback(false, results, fields);
                }
            }
        });
        return 1;
    }
}

exports = module.exports = new DbLogger();
exports.DbLogger = DbLogger;

