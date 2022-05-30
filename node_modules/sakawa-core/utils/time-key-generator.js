const {getInt2Str, getRandomInt} = require('./common');

class TimeKeyGenerator{
    #attn_digit;
    #time_key_int;

    constructor(key_attn_digit, key_int_default) {
        this.#attn_digit = key_attn_digit;
        this.#time_key_int = key_int_default;
    }

    generate() {
        //timestamp
        let ts = new Date().valueOf();
        let str1 = '';
        let str2 = '';
        let str3 = '';
        str1 = ts.toString();
        //index
        str2 = getInt2Str(this.#time_key_int, this.#attn_digit);
        this.#time_key_int++;
        let key_max = (10**this.#attn_digit - 1);
        if(this.#time_key_int > key_max){
            this.#time_key_int = 1;
        }
        //random
        str3 = getInt2Str(getRandomInt(key_max), this.#attn_digit);

        console.log('getTimekey():: a='+ str1 +', b='+ str2 +', c='+ str3);
        return str1 + str2 + str3;
    }
}

module.exports = TimeKeyGenerator;
