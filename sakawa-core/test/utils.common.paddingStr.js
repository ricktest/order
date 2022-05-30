const {paddingStr, paddingLeft, paddingRight, PADDING_LEFT, PADDING_RIGHT} = require('../utils/common');
const assert = require("assert").strict;

describe('utils/common', function () {
    describe('#paddingStr()', function () {
        it('應該符合往右補文字', function () {
            assert.deepEqual(paddingStr('1', 3, '0', PADDING_RIGHT), '100');
        });
        it('應該符合往左補文字', function () {
            assert.deepEqual(paddingStr('1', 3, '0', PADDING_LEFT), '001');
        });
    });

    describe('#paddingRight()', function () {
        it('應該符合往右補文字', function () {
            assert.deepEqual(paddingRight('1', 3, '0'), '100');
        });
    });

    describe('#paddingLeft()', function () {
        it('應該符合往左補文字', function () {
            assert.deepEqual(paddingLeft('1', 3, '0'), '001');
        });
    });
});

