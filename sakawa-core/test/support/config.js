const path = require('path');
const testRootPath = path.resolve(__dirname, '../');
const fileConfig = require(path.join(testRootPath, 'config.json'));

module.exports = fileConfig;
