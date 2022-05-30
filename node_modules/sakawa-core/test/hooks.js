require('./support/env');
const config = require('./support/config');
const migrationSKWMysql = require("./fixtures/migrationSKWMysql");
const migrationDbLogSKWMysql = require("./fixtures/migrationDbLogSKWMysql");
const assert = require("assert").strict;
const testSKWMysql = require("./fixtures/testSKWMysql");
const testDbLogSKWMysql = require("./fixtures/testDbLogSKWMysql");

exports.mochaHooks = {
    afterAll: [
        function (done) {
            //不手動斷線測試程序不會結束
            migrationSKWMysql.pool.end((err) => {
                assert.ifError(err);
                done();
            });
        },
        function (done) {
            //不手動斷線測試程序不會結束
            testSKWMysql.pool.end((err) => {
                assert.ifError(err);
                done();
            });
        },
        function (done) {
            //不手動斷線測試程序不會結束
            migrationDbLogSKWMysql.pool.end((err) => {
                assert.ifError(err);
                done();
            });
        },
        function (done) {
            //不手動斷線測試程序不會結束
            testDbLogSKWMysql.pool.end((err) => {
                assert.ifError(err);
                done();
            });
        },
    ]
}
