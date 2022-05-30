const assert = require('assert').strict;
const {getRandomInt} = require("../utils/common");

describe('utils/common', function () {
    describe('#getRandomInt()', function () {
        it('應該小於傳入數值且大於0', function () {
            const max = 2;
            for (let i = 0;i < 1000;i++){
                const rndInt = getRandomInt(max);
                assert.ok(rndInt < 2 && rndInt >= 0);
            }
        });
    });
});
