const fs = require('fs');

/**
 *
 * @param app
 * @param {{useSSL:boolean, sslCAPath:string[], sslKeyPath:string, sslCertPath:string, dhParamPath:string}|null} config
 */
function createHttpServer (app, config = null) {
    if (typeof config === 'object' && config !== null && config.useSSL) {
        const ca = (function () {
            let i, len
            const results = []
            for (i = 0, len = config.sslCAPath.length; i < len; i++) {
                results.push(fs.readFileSync(config.sslCAPath[i], 'utf8'))
            }
            return results
        })()
        const options = {
            key: fs.readFileSync(config.sslKeyPath, 'utf8'),
            cert: fs.readFileSync(config.sslCertPath, 'utf8'),
            ca: ca,
            dhparam: fs.readFileSync(config.dhParamPath, 'utf8'),
            requestCert: false,
            rejectUnauthorized: false
        }
        return require('https').createServer(options, app)
    } else {
        return require('http').createServer(app)
    }
}

exports.createHttpServer = createHttpServer;
