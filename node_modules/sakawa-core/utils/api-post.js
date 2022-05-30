const {clog} = require('../hdl-logger');
const fetch = require("node-fetch");
const request = require('request');

exports.http_request = function(url, get = {}, post = {}, method= 'POST', timeout = false){
    if(url == undefined){
        clog('http_request -> ERROR 701: no url', 50);
        return false;
    }
    return new Promise((resolve, reject) => {
        let options = {
            'url': url,
            'method': method,
            'timeout' : 30000, //30sec
            'headers': [{
                'User-Agent': 'http_request'
            }]
        };

        if(timeout != false){
            options['timeout'] = timeout;
        }

        if(Object.keys(get).length > 0){
            options['qs'] = get;
        }
        if(method == 'POST'){
            if(Object.keys(post).length > 0){
                options['form'] = post;
            }
        }

        clog('http_request -> url=' + url + ', timeout=' + options['timeout'], 100);
        function make_request_callback(error, response, body){
            if (!error && response.statusCode == 200) {
                resolve(body);
            }else{
                clog('http_request -> ERROR>error=' + JSON.stringify(error));
                clog('http_request -> ERROR>response=' + JSON.stringify(response));
                resolve(false);
            }
        }
        request(options, make_request_callback);
    });
}

// 使用node-fetch
exports.http_request_2 = async function (url, get = {}, post = {}, method = 'POST', timeout = false) {
    if (url == undefined) {
        clog('ERROR: http_request_2 -> ERROR 701: no url', 50);
        return false;
    }
    let options = {
        method: method,
        timeout: 30000, //30sec
        headers: {
            'User-Agent': 'http_request_2',
        }
    };

    if (timeout != false) {
        options['timeout'] = timeout;
    }

    if (method === "POST") {
        options["headers"]["Content-Type"] = 'application/json'
        options["body"] = JSON.stringify(post)
    }

    try {
        let results = await fetch(url, options);
        let resJson = await results.json();
        return resJson;
    } catch (err) {
        clog('ERROR: http_request_2 -> ERROR>error=' + JSON.stringify(err.message), 80);
        clog('ERROR: http_request_2 -> ERROR>response=' + JSON.stringify(err.code), 80);
        return false;
    }
}
