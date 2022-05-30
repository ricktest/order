/**
 *
 * @type {Map<string, SakawaMysql>}
 */
const databaseList = new Map();

/**
 *
 * @param config
 * @param key
 * @return {SakawaMysql}
 */
function addDatabase(config, key = 'default') {
    if (databaseList.has(key)) {
        throw 'key exists';
    }

    const db = new (require("./sakawa-mysql"))(config);

    databaseList.set(key, db);

    return db;
}
exports.addDatabase = addDatabase;

exports.getDatabase = function getDatabase(key) {
    if (key === undefined) key = 'default';

    if (!databaseList.has(key)) {
        throw `key ${key} not exists`;
    }
    return databaseList.get(key);
}
