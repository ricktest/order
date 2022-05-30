const {clog} = require('sakawa-core/hdl-logger');

function myMiddleware(req, res, next) {
    clog('myMiddleware');
    //console.log(next);
    next();
}

module.exports = myMiddleware;
