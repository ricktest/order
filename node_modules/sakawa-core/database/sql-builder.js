const mysql = require("mysql2");
const selectFunctions = ['count', 'sum'];
const identifier = '`';

function includeSelectFunctions(columnStr) {
    return selectFunctions.some(functionName => columnStr.indexOf(functionName) === 0 || columnStr.indexOf(functionName.toUpperCase()) === 0);
}

exports.includeSelectFunctions = includeSelectFunctions;

function includeIdentifier(columnStr) {
    return columnStr.indexOf(identifier) === 0;
}
exports.includeIdentifier = includeIdentifier;

function buildSelect(table_set) {
    if (typeof table_set !== 'object') {
        throw 'table_set must be object';
    }

    let sql_query = '';
    sql_query += 'SELECT';
    if(table_set.distinct === true){
        sql_query += ' distinct';
    }
    if(Array.isArray(table_set.column)){
        sql_query += ' ' + table_set.column.map((column) => '`'+column+'`').join(', ');
    }else if(typeof table_set.column === 'string'){
        if(table_set.column !== ''){
            if(table_set.column === '*'){
                sql_query += ' *';
            }else{
                if ( includeSelectFunctions(table_set.column) ){
                    sql_query += ' '+ table_set.column;
                }else{
                    if (includeIdentifier(table_set.column)){
                        sql_query += ' '+ table_set.column;
                    }else{
                        if (table_set.column.indexOf('*') ===0){
                            sql_query += ' '+ table_set.column;
                        }else{
                            sql_query += ' `'+ table_set.column + '`';
                        }
                    }
                }
            }
        }else{
            sql_query += ' *';
        }
    }else{
        sql_query += ' *';
    }
    //sql_query += ' FROM `' + table_set.database + '`.`' + table_set.table + '`';
    sql_query += ' FROM `' + table_set.table + '`';

    if(table_set.join !== ''){
        sql_query += ' '+ table_set.join;
    }
    if(table_set.where !== ''){
        sql_query += ' WHERE '+ table_set.where;
    }
    if(table_set.groupby !== ''){
        sql_query += ' GROUP BY '+ table_set.groupby;
    }
    if(table_set.orderby !== ''){
        sql_query += ' ORDER BY '+ table_set.orderby;
    }
    if(table_set.max_row !== -1){
        sql_query += ' LIMIT '+ table_set.page + ', '+ table_set.max_row;
    }
    sql_query += ';';

    return sql_query;
}

exports.buildSelect = buildSelect;

function sql_query_set(database = "", table = "") {
    return  {
        database: database,
        table: table,
        column: "*",
        where: "",
        orderby: "",
        join: "",
        groupby: "",
        distinct: true,
        page: 0,
        max_row: -1
    };
}

exports.sql_query_set = sql_query_set;

function buildInsert(table_name, data) {
    let sql_query = '';
    //sql_query += 'INSERT INTO `' + database + '`.`' + table_name + '`';
    sql_query += 'INSERT INTO `' + table_name + '`';

    if(typeof data === 'object'){
        const columns = [];
        const values = [];
        Object.keys(data).forEach((key) => {
            columns.push('`'+key+'`');
            values.push(mysql.escape(data[key]));
        });
        sql_query += ' (' + columns.join(', ') + ') VALUES (' + values.join(', ') + ')';
    }else if(typeof data === 'string'){
        if(data !== ''){
            sql_query += ' '+ mysql.escape(data);
        }
    }else{
        return false;
    }

    return sql_query;
}

exports.buildInsert = buildInsert;

function buildUpdate(table_name, data, finder) {
    let sql_query = '';
    //sql_query += 'UPDATE `' + database + '`.`' + table_name + '` SET ';
    sql_query += 'UPDATE `' + table_name + '` SET ';

    if(typeof data === 'object'){
        sql_query += mysql.escape(data);
    }else if(typeof data === 'string'){
        if(data !== ''){
            sql_query += ' '+ mysql.escape(data);
        }
    }else{
        return false;
    }

    sql_query += ' WHERE ' + finder + ';';

    return sql_query;
}
exports.buildUpdate = buildUpdate;

function buildDelete(table_name, finder) {
    let sql_query = '';
    //sql_query += 'DELETE FROM `' + database + '`.`' + table_name + '`';
    sql_query += 'DELETE FROM `' + table_name + '`';
    sql_query += ' WHERE ' + finder + ';';

    return sql_query;
}
exports.buildDelete = buildDelete;
