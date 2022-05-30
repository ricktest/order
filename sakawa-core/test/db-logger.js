const assert = require('assert').strict;

const config = require("./support/config");
const dbLogger = require('../database/db-logger');
const testDbLogSKWMysql = require('./fixtures/testDbLogSKWMysql');
const testSKWMysql = require('./fixtures/testSKWMysql');

describe('database/db-logger', function () {
    it('require 取得 singleton DbLogger', function () {
        assert.ok(dbLogger instanceof dbLogger.DbLogger);
    });

    context('設定 skwMysql', function () {
        beforeEach(function () {
            dbLogger.initSkwMysql(config.db_log)
        });

        it('#unloadSkwMysql', function () {
            assert.ok(dbLogger.skwMysql !== null);
            dbLogger.unloadSkwMysql();
            assert.ok(dbLogger.skwMysql === null);
        });
    });

    it('#write_query_log', function () {
        dbLogger.write_query_log({}, 'abc', 'sql', null, null, 'm_sql_update');
    })
})
