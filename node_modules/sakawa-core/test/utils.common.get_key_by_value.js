const assert = require('assert').strict;
const {get_key_by_value} = require('../utils/common');

describe('utils/common', function () {
    describe('#get_key_by_value()', function () {
        const obj = {
            name: 'Todd',
            amount: 1,
            price: 30,
            // 無法取得 totalAmount
            totalAmount: 1,
        };

        it('應該取得 name', function () {
            assert.deepEqual(get_key_by_value(obj, 'Todd'), 'name');
        });

        it('應該取得 amount', function () {
            assert.deepEqual(get_key_by_value(obj, 1), 'amount');
        });

        it('應該取得 price', function () {
            assert.deepEqual(get_key_by_value(obj, 30), 'price');
        });

        it('應該只會取得第一個搜尋到的值的 key price，無法另一個相同值的 key totalAmount', function () {
            assert.deepEqual(get_key_by_value(obj, 1), 'amount');
        });
    });
})

