const config = require('../support/config');
const SakawaMysql = require('../../database/sakawa-mysql');

const migrationSKWMysql = new SakawaMysql({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    database: config.db.database,
    password: config.db.password,
    multipleStatements: true,
    show_clog: false,
});

module.exports = migrationSKWMysql;
