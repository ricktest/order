const assert = require('assert').strict;
const {getInt2Str} = require("../utils/common");

describe('utils/common', function () {
    describe('#getInt2Str()', function () {
        it('應該往前補2位0，當傳入1位數', function () {
            assert.deepEqual(getInt2Str(1), '001');
        });
        it('應該往前補1位0，當傳入2位數', function () {
            assert.deepEqual(getInt2Str(21), '021');
        });

        it('應該往前補4位0，當傳入1位數，指定輸出 5 位數', function () {
            assert.deepEqual(getInt2Str(1, 5), '00001');
        });

        it('應該往前補3位0，當傳入2位數，指定輸出 5 位數', function () {
            assert.deepEqual(getInt2Str(21, 5), '00021');
        });
    });
});

