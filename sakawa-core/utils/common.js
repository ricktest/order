function gss(str) {
    return '\'' + escape(str) + '\'';
}
exports.gss = gss;

function gsd(str) {
    return '\'' + (str) + '\'';
}
exports.gsd = gsd;

function getInt2Str(val, showDigit = 3) {
    let str = '0'.repeat(showDigit);
    str += val.toString();
    return str.slice(0 - showDigit);
}
exports.getInt2Str = getInt2Str;

/**
 * 取得小於 max 的隨機數
 * @param max
 * @returns {number}
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
exports.getRandomInt = getRandomInt;

function makeid(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.makeId = makeid;
exports.makeid = makeid;
exports.makeToken = makeid;

// date format start ========

function generateDate(date) {
    if (typeof date === 'string'){
        return new Date(date);
    }else{
        return (date instanceof Date) ? new Date(date.getTime()):new Date();
    }
}

/**
 * 取得 utc +0 日期 YYYY-MM-DD HH:mm:ss
 * @param date
 * @returns {string}
 */
function m_sql_time(date = null){
    let dd = generateDate(date);
    return dd.toISOString().slice(0, 19).replace('T', ' ');
}
exports.m_sql_time = m_sql_time;

function m_sql_time_2(date = null){
    let dd = generateDate(date);
    return `${dd.getUTCFullYear()}-${getInt2Str(dd.getUTCMonth()+1, 2)}-${getInt2Str(dd.getUTCDate(), 2)} ${getInt2Str(dd.getUTCHours(), 2)}:${getInt2Str(dd.getUTCMinutes(), 2)}:${getInt2Str(dd.getUTCSeconds(), 2)}`;
}
exports.m_sql_time_2 = m_sql_time_2;

//From UTC with local timezone shift
function m_sql_time_3(date = null){
    let dd = generateDate(date);
    let dc = dd.getTimezoneOffset();
    let tt = dd.valueOf();
    tt = tt + ((0-dc) * 60 *1000);
    dd.setTime(tt);

    return `${dd.getUTCFullYear()}-${getInt2Str(dd.getUTCMonth()+1, 2)}-${getInt2Str(dd.getUTCDate(), 2)} ${getInt2Str(dd.getUTCHours(), 2)}:${getInt2Str(dd.getUTCMinutes(), 2)}:${getInt2Str(dd.getUTCSeconds(), 2)}`;
}
exports.m_sql_time_3 = m_sql_time_3;

function m_sql_display_time(now){
    let dd = generateDate(now);
    let dc = dd.getTimezoneOffset();
    let tt = dd.valueOf();
    tt = tt + ((0-dc) * 60 *1000);
    dd.setTime(tt);

    return `${dd.getUTCFullYear()}/${getInt2Str(dd.getUTCMonth()+1, 2)}/${getInt2Str(dd.getUTCDate(), 2)} ${getInt2Str(dd.getUTCHours(), 2)}:${getInt2Str(dd.getUTCMinutes(), 2)}:${getInt2Str(dd.getUTCSeconds(), 2)}`;
}
exports.m_sql_display_time = m_sql_display_time;

function get_datetime(now) {
    let date = generateDate(now);
    return `${date.getFullYear()}${getInt2Str(date.getMonth()+1, 2)}${getInt2Str(date.getDate(), 2)}${getInt2Str(date.getHours(), 2)}${getInt2Str(date.getMinutes(), 2)}${getInt2Str(date.getSeconds(), 2)}`;
}
exports.get_datetime = get_datetime;

// date format end ========

function get_key_by_value(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
exports.get_key_by_value = get_key_by_value;


const PADDING_LEFT = 1;
const PADDING_RIGHT = 2;

exports.PADDING_LEFT = PADDING_LEFT;
exports.PADDING_RIGHT = PADDING_RIGHT;

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
function paddingStr(str, targetLength, padString, flag) {
    str = str.toString();
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String((typeof padString !== "undefined" ? padString : "0"));
    if(str.length > targetLength) {
        return String(str);
    }
    targetLength = targetLength - str.length;
    if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
    }
    switch (flag) {
        case PADDING_RIGHT:
            return String(str) + padString.slice(0, targetLength);
        case PADDING_LEFT:
        default:
            return padString.slice(0, targetLength) + String(str);
    }
}

exports.paddingStr = paddingStr;

const paddingLeft = function (str, targetLength, padString) {
    return paddingStr(str, targetLength, padString, PADDING_LEFT);
}
exports.paddingLeft = paddingLeft;

const paddingRight = function (str, targetLength, padString) {
    return paddingStr(str, targetLength, padString, PADDING_RIGHT);
}
exports.paddingRight = paddingRight;

function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
exports.shuffle_array = shuffle_array;

function getRandom(length){
    return Math.floor(Math.random()*length);
}
exports.getRandom = getRandom;

function mix_num_char(numLength, charLength) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';

    let str_arr = [];
    let i;
    let count = 0;
    for(i = 0;i < charLength;i++) {
        str_arr.push(chars.charAt(getRandom(chars.length)));
        count++;
    }

    for(i = 0;i < numLength;i++) {
        str_arr.push(nums.charAt(getRandom(nums.length)));
        count++;
    }

    const rand_array = shuffle_array(str_arr);
    return rand_array.join('');
}
exports.mix_num_char = mix_num_char;

function generate_cmd_key(uid, count) {
    let cmd_key = '';
    let now = new Date(new Date().getTime() - 8 * 60 * 60 * 1000);
    let rand = mix_num_char(6, 6);

    cmd_key = `${get_datetime(now)}_${uid}_${count}_${rand}`;
    return cmd_key;
}
exports.generate_cmd_key = generate_cmd_key;
