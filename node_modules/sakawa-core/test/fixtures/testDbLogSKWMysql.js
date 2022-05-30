const config = require("../support/config");
const SakawaMysql = require('../../database/sakawa-mysql');

const testSKWMysql = new SakawaMysql({
    host: config.db_log.host,
    port: config.db_log.port,
    user: config.db_log.user,
    database: config.db_log.database,
    password: config.db_log.password,
    show_clog: false,
});

module.exports = testSKWMysql;
