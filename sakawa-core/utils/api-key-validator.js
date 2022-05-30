const {clog} = require('../hdl-logger');

const defaultOptions = {
    inputSource: ['body'],
    inputKey: 'apiKey',
    bindKey: 'apiKey',
    apiKey: undefined,
    validator: undefined,
    onInvalidApiKey: undefined
}

function simpleValidatorFactory(targetApiKey) {
    return function (apiKey) {
        return apiKey === targetApiKey;
    };
}

function defaultOnInvalidApiKeyFactory(bindKey) {
    return function (req, res) {
        if (req[bindKey]) {
            clog('keyFail -> no match', 50);
            res.json({ 'status': '401', 'msg': 'keyFail' });
        } else {
            clog('keyFail -> no key', 50);
            res.json({ 'status': '400', 'msg': 'keyFail' });
        }
    }
}

/**
 *
 * @param {{inputSource: string[], inputKey: string, bindKey: string, apiKey: string|undefined, validator: function|undefined, onInvalidApiKey: function|undefined}} options
 * @return {(function(*, *, *): void)|*}
 */
exports.syncValidator = function (options) {
    const _options = {...defaultOptions, ...options};
    if (typeof _options.onInvalidApiKey !== 'function') _options.onInvalidApiKey = defaultOnInvalidApiKeyFactory(_options.bindKey);
    if (typeof _options.validator !== 'function') {
        if (typeof _options.apiKey !== 'string') {
            throw new Error('need validator function, or provide apiKey to use simpleValidator');
        }
        _options.validator = simpleValidatorFactory(_options.apiKey);
    }

    const getApiKey = function (req) {

        let apiKey;

        _options.inputSource.find((source) => {
            if (!apiKey) {
                switch (source) {
                    case 'query':
                        apiKey = req.query[_options.inputKey];
                        break;
                    case 'body':
                    default:
                        apiKey = req.body[_options.inputKey];
                }
                return apiKey;
            }
        });

        return apiKey;
    };

    return function (req, res, next) {
        req[_options.bindKey] = getApiKey(req);
        if (req[_options.bindKey] === undefined) {
            return _options.onInvalidApiKey(req, res);
        }

        if (_options.validator(req.apiKey)) {
            next();
        }else{
            _options.onInvalidApiKey(req, res);
        }
    }
}
