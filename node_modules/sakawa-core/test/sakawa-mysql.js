const assert = require("assert").strict;
const config = require('./support/config');
const {Pool} = require('mysql2');
const SakawaMysql = require("../database/sakawa-mysql");
const mysql = require("mysql2");
const {getInt2Str} = require("../utils/common");

const testSKWMysql = require('./fixtures/testSKWMysql');
const {ResultSetHeader} = require("mysql2");
const migrationSKWMysql = require("./fixtures/migrationSKWMysql");
const testDbMigration = require("./fixtures/testDbMigration");
const {OkPacket} = require("mysql2");

describe('database/SakawaMysql', function () {

    describe('基本屬性、functions', function () {
        context('#pool', function () {
            it('應該不會被外部重設', function () {
                testSKWMysql.pool = null;
                assert.ok(testSKWMysql.pool instanceof Pool);
            });
        });

        context('#exposeObj', function () {
            it('應該可以取得資料庫操作 functions [query, n_query, sql_query_set, m_sql_select, n_sql_select, m_sql_insert, n_sql_insert, m_sql_update, n_sql_update, m_sql_delete, n_sql_delete]', function () {
                ['query', 'n_query', 'sql_query_set', 'm_sql_select', 'n_sql_select', 'm_sql_insert', 'n_sql_insert', 'm_sql_update', 'n_sql_update', 'm_sql_delete', 'n_sql_delete'].forEach((methodName) => {
                    assert.ok(testSKWMysql.exposeObj.hasOwnProperty(methodName));
                    assert.equal(typeof testSKWMysql.exposeObj[methodName], 'function');
                });
            });
        })

        context('#configValue()', function () {
            it('應該可以取得建構傳入的設定值', function () {
                assert.equal(testSKWMysql.configValue('user'), config.db.user);
                assert.equal(testSKWMysql.configValue('password'), config.db.password);
            });
        });

        context('#escape()', function () {
            it('應該是mysql.escape的參照', function () {
                assert.deepEqual(SakawaMysql.escape, mysql.escape);
            });

            it('應該會輸出為字串，當傳入數值時', function () {
                // number
                assert.deepEqual(SakawaMysql.escape(1), '1');
            });

            it('應該會輸出為字數，當傳入布林值時', function () {
                // boolean
                assert.deepEqual(SakawaMysql.escape(true), 'true');
                assert.deepEqual(SakawaMysql.escape(false), 'false');
            });

            it('應該會自動輸出 local time 格式 YYYY-MM-DD HH:mm:ss.mmm ', function () {
                // Date object
                const now = new Date();
                const year = getInt2Str(now.getFullYear(), 4);
                const month = getInt2Str(now.getMonth()+1, 2);
                const date = getInt2Str(now.getDate(), 2);
                const hour = getInt2Str(now.getHours(), 2);
                const min = getInt2Str(now.getMinutes(), 2);
                const sec = getInt2Str(now.getSeconds(), 2);
                const mm = getInt2Str(now.getMilliseconds(), 3);
                assert.deepEqual(SakawaMysql.escape(now), `'${year}-${month}-${date} ${hour}:${min}:${sec}.${mm}'`);
            });

            it('應該會自動輸出指定時區 time 格式 YYYY-MM-DD HH:mm:ss.mmm ', function () {
                // Date object
                const now = new Date();
                const targetTimezone = '-03:00';
                const offsetTz = -3;
                const targetDate = new Date(now.getTime());
                targetDate.setTime(targetDate.getTime() + offsetTz*60*60*1000);
                const year = getInt2Str(targetDate.getUTCFullYear(), 4);
                const month = getInt2Str(targetDate.getUTCMonth()+1, 2);
                const date = getInt2Str(targetDate.getUTCDate(), 2);
                const hour = getInt2Str(targetDate.getUTCHours(), 2);
                const min = getInt2Str(targetDate.getUTCMinutes(), 2);
                const sec = getInt2Str(targetDate.getUTCSeconds(), 2);
                const mm = getInt2Str(targetDate.getUTCMilliseconds(), 3);
                assert.equal(SakawaMysql.escape(now, true, targetTimezone), `'${year}-${month}-${date} ${hour}:${min}:${sec}.${mm}'`);
            });

            it('應該會自動將key加上`，並將value輸出為帶\'的字串，當傳入物件時', function () {
                // object
                assert.deepEqual(SakawaMysql.escape({user: 'todd', running: 'n'}), '`user` = \'todd\', `running` = \'n\'');
            });

            it('應該會輸出為[object Object]`，當傳入物件時且 stringifyObjects 為 true 時。', function () {
                assert.deepEqual(SakawaMysql.escape({user: 'todd', running: 'n'}, true), '\'[object Object]\'');
            });
        })

        context('#sql_query_set()', function () {
            it('應該會輸出預設查詢條件物件', function () {
                assert.deepEqual(
                    testSKWMysql.sql_query_set('user'),
                    {
                        database: testSKWMysql.configValue('database'),
                        table: 'user',
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
    });

    context('#constructor', function () {
        it('應該不會抛出錯誤，當有正確傳入必要參數 user, password', function () {
            assert.doesNotThrow(async () => {
                const db = new SakawaMysql({
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                });
            });
        });

        it('應該會抛出錯誤，當沒有傳入必要參數 user, password', function () {
            assert.throws(() => {
                const db = new SakawaMysql();
            })
        });
    });

    describe('query 相關', function () {
        context('#query()', function () {
            it('回呼參數與mysql#query相同', function (done) {
                testSKWMysql.query('SELECT 1', (err, results, fields) => {
                    assert.ifError(err);
                    assert.equal(results.length, 1);
                    assert.equal(results[0]['1'], 1);
                    done();
                });
            });

            it('應該由 err 判斷是否為執行錯誤', function (done) {
                testSKWMysql.query('SELECT SQL_ERROR', (err, results, fields) => {
                    assert.ok(err !== null);
                    done();
                });
            });
        });

        context('#n_query()', function () {
            it('回呼參數與mysql#query相同', async function () {
                const [results, fields] = await testSKWMysql.n_query('SELECT 1');
                assert.equal(results.length, 1);
                assert.equal(results[0]['1'], 1);
            });

            it('SQL 執行錯誤會 reject', function () {
                assert.rejects(testSKWMysql.n_query('SELECT SQL_ERROR'));
            });
        });
    });

    describe('select 相關', function () {
        before(function (done) {
            migrationSKWMysql.query(testDbMigration.up, (err, results, fields) => {
                assert.ifError(err);
                done();
            });
        });

        beforeEach(async function () {
            const dummyUsers = [
                {id: 1, last_name: 'tsai', first_name: 'todd', nums: 1},
                {id: 2, last_name: 'tsai', first_name: 'todd2', nums: 1},
                {id: 3, last_name: 'tsai', first_name: 'todd3', nums: null},
            ];

            for (let i = 0; i < dummyUsers.length; i++) {
                const {id, last_name, first_name, nums = undefined} = dummyUsers[i];
                const [results, fields] = await testSKWMysql.n_query(`REPLACE INTO user (id, last_name, first_name, nums) VALUE (${id},${testSKWMysql.escape(last_name)},${testSKWMysql.escape(first_name)}, ${nums})`);
            }
        });

        afterEach(async function () {
            testSKWMysql.query('TRUNCATE user');
        });

        after(async function () {
            const [results, fields] = await migrationSKWMysql.n_query(testDbMigration.down);
        });

        context('#m_sql_select()', function () {
            it('回呼參數', function (done) {
                const querySet = testSKWMysql.sql_query_set('user');
                testSKWMysql.m_sql_select(querySet, (success, results, fields, error) => {
                    assert.ifError(error);
                    assert.equal(typeof success, 'boolean');
                    assert.ok(Array.isArray(results));
                    assert.ok(Array.isArray(fields));
                    assert.equal(results[0]['id'], 1);
                    assert.ok(fields.length, 4);
                    assert.ok(fields[0].constructor.name === 'ColumnDefinition');
                    done();
                });
            });

            it('SQL 執行錯誤時 callback 會傳入第4個參數 error', function (done) {
                const querySet = testSKWMysql.sql_query_set('user');
                querySet.column = 'SQL_ERROR';
                testSKWMysql.m_sql_select(querySet, (success, results, fields, error) => {
                    assert.equal(success, false);
                    assert.equal(results, undefined);
                    assert.equal(fields, undefined);
                    assert.ok(error instanceof Error);
                    done();
                });
            });

            it('查詢結果為空', function (done) {
                const querySet = testSKWMysql.sql_query_set('user');
                querySet.where = testSKWMysql.escape({first_name: 'todd4'});
                testSKWMysql.m_sql_select(querySet, (success, results, fields) => {
                    assert.ok(success === false);
                    assert.equal(0, results.length);
                    assert.equal(fields.length, 4);
                    assert.ok(fields[0].constructor.name === 'ColumnDefinition');
                    done();
                });
            });
        });

        context('#n_sql_select()', function () {
            it('回呼參數', async function () {
                const querySet = testSKWMysql.sql_query_set('user');
                const [success, results, fields] = await testSKWMysql.n_sql_select(querySet);
                assert.equal(typeof success, 'boolean');
                assert.ok(Array.isArray(results));
                assert.ok(Array.isArray(fields));
                assert.equal(results[0]['id'], 1);
                assert.ok(fields.length, 4);
                assert.ok(fields[0].constructor.name === 'ColumnDefinition');
            });

            it('SQL 執行錯誤會 reject', function () {
                const querySet = testSKWMysql.sql_query_set('user');
                querySet.column = 'SQL_ERROR';
                assert.rejects(testSKWMysql.n_sql_select(querySet));
            });

            it('查詢結果為空', async function () {
                const querySet = testSKWMysql.sql_query_set('user');
                querySet.where = testSKWMysql.escape({first_name: 'todd4'});
                const [success, results, fields] = await testSKWMysql.n_sql_select(querySet);
                assert.ok(success === false);
                assert.equal(0, results.length);
                assert.equal(fields.length, 4);
                assert.ok(fields[0].constructor.name === 'ColumnDefinition');
            });
        });
    });

    describe('insert 相關', function () {

        before(function (done) {
            migrationSKWMysql.query(testDbMigration.up, (err, results, fields) => {
                assert.ifError(err);
                done();
            });
        });

        after(async function () {
            const [results, fields] = await migrationSKWMysql.n_query(testDbMigration.down);
        });

        afterEach(async function () {
            testSKWMysql.query('TRUNCATE user');
        });

        context('#m_sql_insert()', function () {
            it('回呼參數', function (done) {
                testSKWMysql.m_sql_insert('user', {last_name: 'tsai', first_name: 'todd'}, (success, results, fields) => {
                    assert.equal(typeof success, 'boolean');
                    assert.ok(typeof results === 'object');
                    assert.ok(results.hasOwnProperty('fieldCount'));
                    assert.ok(results.hasOwnProperty('affectedRows'));
                    assert.ok(results.hasOwnProperty('insertId'));
                    assert.ok(results.hasOwnProperty('info'));
                    assert.ok(results.hasOwnProperty('serverStatus'));
                    assert.ok(results.hasOwnProperty('warningStatus'));
                    assert.equal(results.insertId, 1);
                    assert.equal(fields, undefined);
                    done();
                });
            });

            it('SQL 執行錯誤時 callback 會傳入第4個參數 error', function (done) {
                const data = {last_name: 'tsai', first_name: 'todd'};
                testSKWMysql.m_sql_insert('user', `(\`last_name\`, \`first_name\`) VALUES (${SakawaMysql.escape(data.last_name)}, ${SakawaMysql.escape(data.first_name)}')`, (success, results, fields, error) => {
                    assert.equal(success, false);
                    assert.equal(results, undefined);
                    assert.equal(fields, undefined);
                    assert.ok(error instanceof Error);
                    done();
                });
            });
        });

        context('#n_sql_insert()', function () {
            it('回呼參數', async function () {
                const [success, results, fields] = await testSKWMysql.n_sql_insert('user', {last_name: 'tsai', first_name: 'todd'});
                assert.equal(typeof success, 'boolean');
                assert.ok(typeof results === 'object');
                assert.ok(results.hasOwnProperty('fieldCount'));
                assert.ok(results.hasOwnProperty('affectedRows'));
                assert.ok(results.hasOwnProperty('insertId'));
                assert.ok(results.hasOwnProperty('info'));
                assert.ok(results.hasOwnProperty('serverStatus'));
                assert.ok(results.hasOwnProperty('warningStatus'));
                assert.equal(results.insertId, 1);
                assert.equal(fields, undefined);
            });

            it('SQL 執行錯誤會 reject', function () {
                const data = {last_name: 'tsai', first_name: 'todd'};
                assert.rejects(testSKWMysql.n_sql_insert('user', `(\`last_name\`, \`first_name\`) VALUES (${SakawaMysql.escape(data.last_name)}, ${SakawaMysql.escape(data.first_name)}')`));
            });
        });
    });

    describe('update 相關', function () {

        before(function (done) {
            migrationSKWMysql.query(testDbMigration.up, (err, results, fields) => {
                assert.ifError(err);
                done();
            });
        });

        beforeEach(async function () {
            const dummyUsers = [
                {id: 1, last_name: 'tsai', first_name: 'todd', nums: 1},
                {id: 2, last_name: 'tsai', first_name: 'todd2', nums: 1},
                {id: 3, last_name: 'tsai', first_name: 'todd3', nums: null},
                {id: 4, last_name: 'wang', first_name: 'todd4', nums: null},
                {id: 5, last_name: 'wang', first_name: 'todd5', nums: null},
            ];

            for (let i = 0; i < dummyUsers.length; i++) {
                const {id, last_name, first_name, nums = undefined} = dummyUsers[i];
                const [results, fields] = await testSKWMysql.n_query(`REPLACE INTO user (id, last_name, first_name, nums) VALUE (${id},${testSKWMysql.escape(last_name)},${testSKWMysql.escape(first_name)}, ${nums})`);
            }
        });

        afterEach(async function () {
            testSKWMysql.query('TRUNCATE user');
        });

        after(async function () {
            const [results, fields] = await migrationSKWMysql.n_query(testDbMigration.down);
        });

        const data = {first_name: 'todd4'};

        context('#m_sql_update()', function () {

            it('回呼參數', function (done) {
                const inputData = 'wang';
                testSKWMysql.m_sql_update('user', data, `last_name = ${SakawaMysql.escape(inputData)}`, (success, results, fields) => {
                    assert.equal(typeof success, 'boolean');

                    assert.ok(typeof results === 'object');
                    assert.ok(results.hasOwnProperty('fieldCount'));
                    assert.ok(results.hasOwnProperty('affectedRows'));
                    assert.ok(results.hasOwnProperty('insertId'));
                    assert.ok(results.hasOwnProperty('info'));
                    assert.ok(results.hasOwnProperty('serverStatus'));
                    assert.ok(results.hasOwnProperty('warningStatus'));
                    assert.equal(fields, undefined);
                    assert.equal(typeof results.affectedRows, 'number');
                    assert.equal(typeof results.changedRows, 'number');
                    done();
                });
            });

            it('SQL 執行錯誤時 callback 會傳入第4個參數 error', function (done) {
                testSKWMysql.m_sql_update('user', data, 'not_exist_column = 1', (success, results, fields, error) => {
                    assert.equal(success, false);
                    assert.equal(results, undefined);
                    assert.equal(fields, undefined);
                    assert.ok(error instanceof Error);
                    done();
                });
            });

            it('更新結果沒有異動', function (done) {
                testSKWMysql.m_sql_update('user', data, 'id = 0', (success, results, fields) => {
                    assert.ok(success === false);

                    assert.ok(typeof results === 'object');
                    assert.ok(results.hasOwnProperty('fieldCount'));
                    assert.ok(results.hasOwnProperty('affectedRows'));
                    assert.ok(results.hasOwnProperty('insertId'));
                    assert.ok(results.hasOwnProperty('info'));
                    assert.ok(results.hasOwnProperty('serverStatus'));
                    assert.ok(results.hasOwnProperty('warningStatus'));
                    assert.equal(fields, undefined);
                    assert.equal(results.affectedRows, 0);
                    assert.equal(results.changedRows, 0);
                    done();
                });
            });
        });

        context('#n_sql_update()', function () {
            it('回呼參數', async function () {
                const inputData = 'wang';
                const [success, results, fields] = await testSKWMysql.n_sql_update('user', data, `last_name = ${SakawaMysql.escape(inputData)}`);
                assert.equal(typeof success, 'boolean');

                assert.ok(typeof results === 'object');
                assert.ok(results.hasOwnProperty('fieldCount'));
                assert.ok(results.hasOwnProperty('affectedRows'));
                assert.ok(results.hasOwnProperty('insertId'));
                assert.ok(results.hasOwnProperty('info'));
                assert.ok(results.hasOwnProperty('serverStatus'));
                assert.ok(results.hasOwnProperty('warningStatus'));
                assert.equal(fields, undefined);
                assert.equal(typeof results.affectedRows, 'number');
                assert.equal(typeof results.changedRows, 'number');
            });

            it('SQL 執行錯誤會 reject', function () {
                assert.rejects(testSKWMysql.n_sql_update('user', data, 'not_exist_column = 1'));
            });

            it('更新結果沒有異動', async function () {
                const [success, results, fields] = await testSKWMysql.n_sql_update('user', data, 'id = 0');
                assert.ok(success === false);

                assert.ok(typeof results === 'object');
                assert.ok(results.hasOwnProperty('fieldCount'));
                assert.ok(results.hasOwnProperty('affectedRows'));
                assert.ok(results.hasOwnProperty('insertId'));
                assert.ok(results.hasOwnProperty('info'));
                assert.ok(results.hasOwnProperty('serverStatus'));
                assert.ok(results.hasOwnProperty('warningStatus'));
                assert.equal(fields, undefined);
                assert.equal(results.affectedRows, 0);
                assert.equal(results.changedRows, 0);
            });
        });
    });

    describe('delete 相關', function () {

        before(function (done) {
            migrationSKWMysql.query(testDbMigration.up, (err, results, fields) => {
                assert.ifError(err);
                done();
            });
        });

        beforeEach(async function () {
            const dummyUsers = [
                {id: 1, last_name: 'tsai', first_name: 'todd', nums: 1},
                {id: 2, last_name: 'tsai', first_name: 'todd2', nums: 1},
                {id: 3, last_name: 'tsai', first_name: 'todd3', nums: null},
            ];

            for (let i = 0; i < dummyUsers.length; i++) {
                const {id, last_name, first_name, nums = undefined} = dummyUsers[i];
                const [results, fields] = await testSKWMysql.n_query(`REPLACE INTO user (id, last_name, first_name, nums) VALUE (${id},${testSKWMysql.escape(last_name)},${testSKWMysql.escape(first_name)}, ${nums})`);
            }
        });

        afterEach(async function () {
            testSKWMysql.query('TRUNCATE user');
        });

        after(async function () {
            const [results, fields] = await migrationSKWMysql.n_query(testDbMigration.down);
        });

        context('#m_sql_delete()', function () {

            it('回呼參數', function (done) {
                const inputData = 'tsai';
                testSKWMysql.m_sql_delete('user',`last_name = ${SakawaMysql.escape(inputData)}`, (success, results, fields) => {
                    assert.equal(typeof success, 'boolean');

                    assert.ok(typeof results === 'object');
                    assert.ok(results.hasOwnProperty('fieldCount'));
                    assert.ok(results.hasOwnProperty('affectedRows'));
                    assert.ok(results.hasOwnProperty('insertId'));
                    assert.ok(results.hasOwnProperty('info'));
                    assert.ok(results.hasOwnProperty('serverStatus'));
                    assert.ok(results.hasOwnProperty('warningStatus'));
                    assert.equal(fields, undefined);
                    assert.equal(typeof results.affectedRows, 'number');
                    done();
                });
            });

            it('SQL 執行錯誤時 callback 會傳入第4個參數 error', function (done) {
                testSKWMysql.m_sql_delete('user', 'not_exist_column = 1', (success, results, fields, error) => {
                    assert.equal(success, false);
                    assert.equal(results, undefined);
                    assert.equal(fields, undefined);
                    assert.ok(error instanceof Error);
                    done();
                });
            });

            it('刪除結果沒有異動', function (done) {
                testSKWMysql.m_sql_delete('user', 'id = 0', (success, results, fields) => {
                    assert.ok(success === false);

                    assert.ok(typeof results === 'object');
                    assert.ok(results.hasOwnProperty('fieldCount'));
                    assert.ok(results.hasOwnProperty('affectedRows'));
                    assert.ok(results.hasOwnProperty('insertId'));
                    assert.ok(results.hasOwnProperty('info'));
                    assert.ok(results.hasOwnProperty('serverStatus'));
                    assert.ok(results.hasOwnProperty('warningStatus'));
                    assert.equal(fields, undefined);
                    assert.equal(results.affectedRows, 0);
                    done();
                });
            });
        });

        context('#n_sql_delete()', function () {
            it('回呼參數', async function () {
                const inputData = 'tsai';
                const [success, results, fields] = await testSKWMysql.n_sql_delete('user', `last_name = ${SakawaMysql.escape(inputData)}`);
                assert.equal(typeof success, 'boolean');

                assert.ok(typeof results === 'object');
                assert.ok(results.hasOwnProperty('fieldCount'));
                assert.ok(results.hasOwnProperty('affectedRows'));
                assert.ok(results.hasOwnProperty('insertId'));
                assert.ok(results.hasOwnProperty('info'));
                assert.ok(results.hasOwnProperty('serverStatus'));
                assert.ok(results.hasOwnProperty('warningStatus'));
                assert.equal(fields, undefined);
                assert.equal(typeof results.affectedRows, 'number');
            });

            it('SQL 執行錯誤會 reject', function () {
                assert.rejects(testSKWMysql.n_sql_delete('user', 'not_exist_column = 1'));
            });

            it('刪除結果沒有異動', async function () {
                const [success, results, fields] = await testSKWMysql.n_sql_delete('user', 'id = 0');
                assert.ok(success === false);

                assert.ok(typeof results === 'object');
                assert.ok(results.hasOwnProperty('fieldCount'));
                assert.ok(results.hasOwnProperty('affectedRows'));
                assert.ok(results.hasOwnProperty('insertId'));
                assert.ok(results.hasOwnProperty('info'));
                assert.ok(results.hasOwnProperty('serverStatus'));
                assert.ok(results.hasOwnProperty('warningStatus'));
                assert.equal(fields, undefined);
                assert.equal(results.affectedRows, 0);
            });
        });
    });
});
