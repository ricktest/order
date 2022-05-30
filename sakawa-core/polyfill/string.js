const {paddingStr, paddingLeft, paddingRight} = require('../utils/common');

String.prototype.paddingStr = function (targetLength, padString, flag) {
    return paddingStr(this, targetLength, padString, flag);
}

String.prototype.paddingLeft = function (targetLength, padString) {
    return paddingLeft(this, targetLength, padString);
}

String.prototype.paddingRight = function (targetLength, padString) {
    return paddingRight(this, targetLength, padString);
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function (targetLength, padString) {
        return paddingLeft(this, targetLength, padString);
    };
}


if (!String.prototype.padEnd) {
    String.prototype.padEnd = (targetLength, padString) => {
        return paddingRight(this, targetLength, padString);
    }
}
