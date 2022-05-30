const mysql = require('mysql2');
const {sql_query_set, buildSelect, buildInsert, buildUpdate, buildDelete} = require('./sql-builder');
const {clog} = require('../hdl-logger');
const dbLogger = require('./db-logger');

const DEFAULT_CONFIG = {
    port: 3306,
    charset: 'utf8mb4',
    connectionLimit: 10,
    waitForConnections: true,
    multipleStatements: false,
    show_clog: true,
}

class SakawaMysql{

    #config = null;
    #dbPool = null;
    #exposeObj = null;

    constructor(config) {
        ['user', 'password'].forEach((field) => {
            const value = config[field];
            if (value === '' || value === undefined || value === null) {
                throw new Error(`config need ${field}.`);
            }
        });

        this.#config = {...DEFAULT_CONFIG, ...config};
        delete this.#config.show_clog;

        this.#dbPool = mysql.createPool(this.#config);
    }

    get exposeObj() {
        if (this.#exposeObj === null) {
            this.#exposeObj = {};
            ['query', 'n_query', 'sql_query_set', 'm_sql_select', 'n_sql_select', 'm_sql_insert', 'n_sql_insert', 'm_sql_update', 'n_sql_update', 'm_sql_delete', 'n_sql_delete'].forEach((methodName) => {
                this.#exposeObj[methodName] = this[methodName].bind(this);
            });
        }
        return this.#exposeObj;
    }

    get pool() {
        return this.#dbPool;
    }

    configValue(key) {
        return this.#config[key];
    }

    escape(...args) {
        return mysql.escape(...args);
    }

    log(msg, level = 100) {
        if (this.#config.show_clog) {
            clog(msg, level);
        }
    }

    query(sql, callback, log = true){
        // console.log('callback type ', typeof callback)
        if (log) {
            this.log('mysql.query=' + sql);
        }
        this.#dbPool.getConnection((err, conn) => {
            if(err){
                if (log === true) {
                    this.log('query throw error : ' + err, 50);
                }
                if (typeof callback === 'function') {
                    callback(err, null, null);
                }
            }else{
                conn.query(sql, (qerr, vals, fields) => {
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    if (typeof callback === 'function') {
                        callback(qerr, vals, fields);
                    }
                });
            }
        });
    }

    n_query(sql, log = true) {
        return new Promise((resolve, reject) => {
            this.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                }else{
                    resolve([results, fields]);
                }
            }, log);
        });
    }

    sql_query_set(table_name) {
        return sql_query_set(this.#config.database, table_name);
    }

    m_sql_select(table_set, callback, log = true) {
        if (typeof table_set !== 'object') {
            throw 'table_set must be object';
        }

        if (log) {
            this.log('mysql.m_sql_select=' + table_set.database + '.' + table_set.table + ' pool=' + this.#config.database);
        }
        let sql_query = buildSelect(table_set);

        if (log) {
            this.log('mysql.m_sql_select_sql : ' + sql_query);
        }

        this.query(sql_query, (error, results, fields) => {
            if (log) {
                // db_log.write_query_log(this, table_set.table, sql_query, error, results, 'm_sql_select');
            }
            if (error) {
                //throw error;
                if (log) {
                    this.log('mysql.m_sql_select ' + table_set.table + ' throw error : ' + error, 50);
                }
                callback(false, results, fields, error);
            }
            else{
                if (log) {
                    this.log('mysql.m_sql_select ' + table_set.table + ' result : len=' + results.length, 100);
                }
                callback(results.length > 0, results, fields);
            }
        }, log);
    }

    n_sql_select(table_set, log = true) {
        return new Promise((resolve, reject) => {
            this.m_sql_select(table_set, (success, results, fields, error) => {
                if (error) return reject(error);
                resolve([success, results, fields]);
            }, log);
        });
    }

    m_sql_insert(table_name, data, callback, log = true) {
        if (log === true) {
            this.log('mysql.m_sql_insert=' + table_name);
        }
        let sql_query = buildInsert(table_name, data);
        if (sql_query === false) {
            callback(false, undefined, undefined);
            return;
        }

        if (log === true) {
            this.log('mysql.m_sql_insert : ' + sql_query);
        }

        this.query(sql_query, (error, results, fields) => {
            if (log === true) {
                dbLogger.write_query_log({}, table_name, sql_query, error, results, 'm_sql_insert');
            }
            if (error) {
                if (log === true) {
                    this.log('mysql.m_sql_insert throw error : ' + error, 50);
                }
                // throw error;
                if (typeof callback === 'function') {
                    callback(false, results, fields, error);
                }
            }
            else{
                if (log === true) {
                    this.log('mysql.m_sql_insert result : len=' + results.affectedRows, 100);
                }
                if (typeof callback === 'function') {
                    callback(results.affectedRows > 0, results, fields);
                }
            }
        }, log);
    }

    n_sql_insert(table_name, data, log = true) {
        return new Promise((resolve, reject) => {
            this.m_sql_insert(table_name, data, (success, results, fields, error) => {
                if (error) return reject(error);
                resolve([success, results, fields]);
            }, log);
        });
    }

    m_sql_update(table_name, data, finder, callback, log = true){
        if (log === true) {
            this.log('mysql.m_sql_update=' + table_name)
        }
        let sql_query = buildUpdate(table_name, data, finder);

        if (sql_query === false) {
            callback(false, undefined, undefined);
            return;
        }

        if (log === true) {
            this.log('mysql.m_sql_update : ' + sql_query);
        }

        this.query(sql_query, (error, results, fields) => {
            if (log === true) {
                dbLogger.write_query_log(this, table_name, sql_query, error, results, 'm_sql_update');
            }
            if (error) {
                if (log === true) {
                    this.log('mysql.m_sql_update throw error : ' + error, 50);
                }
                //throw error;
                callback(false, results, fields, error);
            }
            else{
                if (log === true) {
                    this.log('mysql.m_sql_update result : len=' + results.affectedRows, 100);
                }
                callback(results.affectedRows > 0, results, fields);
            }
        }, log);
    }

    n_sql_update(table_name, data, finder, log = true) {
        return new Promise((resolve, reject) => {
            this.m_sql_update(table_name, data, finder, (success, results, fields, error) => {
                if (error) return reject(error);

                resolve([success, results, fields]);
            }, log);
        })
    }

    m_sql_delete(table_name, finder, callback, log = true){
        if (log === true) {
            this.log('mysql.m_sql_delete=' + table_name);
        }
        let sql_query = buildDelete(table_name, finder);

        if (log === true) {
            this.log('mysql.m_sql_delete : ' + sql_query);
        }

        this.query(sql_query, (error, results, fields) => {
            if (log === true) {
                dbLogger.write_query_log(this, table_name, sql_query, error, results, 'm_sql_delete');
            }
            if (error) {
                if (log === true) {
                    this.log('mysql.m_sql_delete throw error : ' + error, 50);
                }
                //throw error;
                callback(false, results, fields, error);
            }
            else{
                if (log === true) {
                    this.log('mysql.m_sql_delete result : len=' + results.affectedRows, 100);
                }
                callback(results.affectedRows > 0, results, fields);
            }
        }, log);
    }

    n_sql_delete(table_name, finder, log = true) {
        return new Promise((resolve, reject) => {
            this.m_sql_delete(table_name, finder, (success, results, fields, error) => {
                if (error) return reject(error);
                resolve([success, results, fields]);
            }, log);
        })
    }
}

exports = module.exports = SakawaMysql;

exports.sql_query_set = sql_query_set;

exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
exports.escape = mysql.escape;
