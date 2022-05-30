const assert = require('assert').strict;
const {sql_query_set, buildSelect, buildInsert, buildUpdate, buildDelete} = require('../database/sql-builder');
const mysql = require('mysql2');
const SakawaMysql = require("../database/sakawa-mysql");

describe('database/SqlBuilder', function () {

    context('#sql_query_set()', function () {
        it('應該會輸出預設查詢條件物件', function () {
            assert.deepEqual(
                sql_query_set('database_name', 'table_name'),
                {
                    database: 'database_name',
                    table: 'table_name',
                    column: "*",
                    where: "",
                    orderby: "",
                    join: "",
                    groupby: "",
                    distinct: true,
                    page: 0,
                    max_row: -1
                }
            );
        });
    })

    context('#buildSelect', function () {
        let querySet;
        beforeEach(function () {
            querySet = sql_query_set('database_name', 'table_name');
        });

        it('使用預設的 querySet 產出格式', function () {
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name`;');
        });

        it('不使用 distinct', function () {
            querySet.distinct = false;
            assert.equal(buildSelect(querySet), 'SELECT * FROM `table_name`;');
        });

        it('使用字串指定 column, 沒有包含 ` 字元會產出錯誤的 SELECT columns SQL 語法', function () {
            querySet.column = 'id,last_name';
            assert.equal(buildSelect(querySet), 'SELECT distinct `id,last_name` FROM `table_name`;');
        });

        it('使用字串指定 column, 並使用 ` 字元包住欄位名稱', function () {
            querySet.column = '`id`,`last_name`';
            assert.equal(buildSelect(querySet), 'SELECT distinct `id`,`last_name` FROM `table_name`;');
        });

        it('使用陣列指定 column', function () {
            querySet.column = ['id', 'last_name'];
            assert.equal(buildSelect(querySet), 'SELECT distinct `id`, `last_name` FROM `table_name`;');
        });

        it('使用 SELECT functions', function () {
            querySet.column = 'count(id)';
            assert.equal(buildSelect(querySet), 'SELECT distinct count(id) FROM `table_name`;');
            querySet.column = 'COUNT(id)';
            assert.equal(buildSelect(querySet), 'SELECT distinct COUNT(id) FROM `table_name`;');
            querySet.column = 'sum(id)';
            assert.equal(buildSelect(querySet), 'SELECT distinct sum(id) FROM `table_name`;');
            querySet.column = 'SUM(id)';
            assert.equal(buildSelect(querySet), 'SELECT distinct SUM(id) FROM `table_name`;');

            //只開放使用 count, sum, 其他會使用 identifiers 禁止使用
            querySet.column = 'avg(id)';
            assert.equal(buildSelect(querySet), 'SELECT distinct `avg(id)` FROM `table_name`;');
            querySet.column = 'AVG(id)';
            assert.equal(buildSelect(querySet), 'SELECT distinct `AVG(id)` FROM `table_name`;');
        });

        it('設定 join', function () {
            querySet.join = 'JOIN table2 ON table2.fid = table_name.id';
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` JOIN table2 ON table2.fid = table_name.id;');
        });

        it('設定 where', function () {
            const inputNum = 1;
            const inputStr = '1';
            querySet.where = `id = ${inputNum} AND nums = ${inputStr}`;
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` WHERE id = 1 AND nums = 1;');
            querySet.where = `id = ${mysql.escape(inputNum)} AND nums = ${mysql.escape(inputStr)}`;
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` WHERE id = 1 AND nums = \'1\';');
            querySet.where = `id IN (${mysql.escape([inputNum, inputStr])})`;
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` WHERE id IN (1, \'1\');');
        });

        it('設定 groupby 建立 GROUP BY 語法', function () {
            querySet.groupby = 'table_name.id';
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` GROUP BY table_name.id;');
        });

        it('設定 orderby 建立 ORDER BY 語法', function () {
            querySet.orderby = 'table_name.id DESC';
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` ORDER BY table_name.id DESC;');
        });

        it('設定 max, page 建立 LIMIT OFFSET 語法', function () {
            querySet.max_row = 10;
            querySet.page = 20;
            assert.equal(buildSelect(querySet), 'SELECT distinct * FROM `table_name` LIMIT 20, 10;');
        });
    });

    context('#buildInsert', function () {
        it('使用物件設定資料', function () {
            assert.equal(buildInsert('table_name', {column_int: 1, column_str: 'text'}), 'INSERT INTO `table_name` (`column_int`, `column_str`) VALUES (1, \'text\')');
        });
        it('使用字串設定資料，無法產出可執行的 SQL 語法', function () {
            assert.equal(buildInsert('table_name', `(\`column_int\`, \`column_str\`) VALUES (1, 'text')`), 'INSERT INTO `table_name` \'(`column_int`, `column_str`) VALUES (1, \\\'text\\\')\'');
        });
    });

    context('#buildUpdate', function () {
        it('使用物件設定資料', function () {
            const data = {column_int: 1, column_str: 'text'};
            const inputId = 1;
            assert.equal(buildUpdate('table_name', data, `id = ${SakawaMysql.escape(inputId)}`), 'UPDATE `table_name` SET `column_int` = 1, `column_str` = \'text\' WHERE id = 1;');
        });
        it('使用字串設定資料，無法產出可執行的 SQL 語法', function () {
            const inputId = 1;
            assert.equal(buildUpdate('table_name', `\`column_int\` = 1, \`column_str\` = \'text\'`, `id = ${SakawaMysql.escape(inputId)}`), 'UPDATE `table_name` SET  \'`column_int` = 1, `column_str` = \\\'text\\\'\' WHERE id = 1;');
        });
    });

    context('#buildDelete', function () {
        it('使用字串設定資料', function () {
            const inputId = 1;
            assert.equal(buildDelete('table_name', `id = ${SakawaMysql.escape(inputId)}`), 'DELETE FROM `table_name` WHERE id = 1;');
        });
    });
});
