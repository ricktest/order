const {clog} = require('../hdl-logger');
const workerpool = require('workerpool');

const wks_pool = workerpool.pool(__dirname + '/mt_wkp_json.js', {maxWorkers: 7});

let debug = false;

let encode_index = 0;
let encode_pend_count = 0;
let decode_index = 0;
let decode_pend_count = 0;

let encode_curr_dt = 0;
let encode_max_dt = 0;
let encode_max_len = 0;
let decode_curr_dt = 0;
let decode_max_dt = 0;
let decode_max_len = 0;

exports.debug = debug;

exports.encode_index = encode_index;
exports.encode_pend_count = encode_pend_count;
exports.decode_index = decode_index;
exports.decode_pend_count = decode_pend_count;

exports.encode_curr_dt = encode_curr_dt;
exports.encode_max_dt = encode_max_dt;
exports.encode_max_len = encode_max_len;
exports.decode_curr_dt = decode_curr_dt;
exports.decode_max_dt = decode_max_dt;
exports.decode_max_len = decode_max_len;

class n_json_converter_pro{
    async encode(data, callback = false){
        let t_id = this.encode_index++;
        this.encode_pend_count++;
        let initialTime = new Date();
        let a = await this.json.work_send(data, '_encode');
        let nowTime = new Date();
        this.encode_pend_count--;
        this.encode_curr_dt = (nowTime - initialTime);
        if(this.encode_curr_dt > this.encode_max_dt){
            this.encode_max_dt = this.encode_curr_dt;
        }
        let len = a.length;
        if(len > this.encode_max_len){
            this.encode_max_len = len;
        }
        if(this.debug){
            clog(`n_json_converter_pro encode id= ${t_id} , pending ${this.encode_pend_count} of 7, outputlen=${len}, finish: ${nowTime - initialTime} ms`);
        }
        if(typeof callback == 'function'){
            callback(a);
        }
        return a;
    }
    async decode(data, callback = false){
        let t_id = this.decode_index++;
        this.decode_pend_count++;
        let initialTime = new Date();
        let a = await this.json.work_send(data, '_decode');
        let nowTime = new Date();
        this.decode_pend_count--;
        this.decode_curr_dt = (nowTime - initialTime);
        if(this.decode_curr_dt > this.decode_max_dt){
            this.decode_max_dt = this.decode_curr_dt;
        }
        let len = data.length;
        if(len > this.decode_max_len){
            this.decode_max_len = len;
        }
        if(this.debug){
            clog(`n_json_converter_pro encode id= ${t_id} , pending ${this.decode_pend_count} of 7, inputlen=${len}, finish: ${nowTime - initialTime} ms`);
        }
        if(typeof callback == 'function'){
            callback(a);
        }
        return a;
    }
    work_send(data, target_func){
        return wks_pool.exec(target_func, [data]);
    }
}
class n_json_converter{
    constructor(){

    }
    encode(data, cb){
        cb(JSON.stringify(data));
    }
    decode(data, cb){
        cb(JSON.parse(data));
    }
}

let json = new n_json_converter_pro();
exports.json = json;
exports.encode = json.encode;
exports.decode = json.decode;

exports.n_json_converter_pro = n_json_converter_pro;
exports.n_json_converter = n_json_converter;
