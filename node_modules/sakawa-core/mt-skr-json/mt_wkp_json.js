const workerpool = require('workerpool');

function _encode(data){
    return JSON.stringify(data);
}
function _decode(data){
    return JSON.parse(data);
}

workerpool.worker({
    _encode: _encode,
    _decode: _decode
});