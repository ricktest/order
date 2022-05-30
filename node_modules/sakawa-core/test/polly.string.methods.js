const assert = require('assert').strict;
require('../polyfill/string');
const {PADDING_RIGHT, PADDING_LEFT, paddingStr, paddingRight, paddingLeft} = require('../utils/common');

describe('polyfill/String', function () {
    describe('#paddingStr()', function () {
        it('應該符合往右補文字', function () {
            assert.deepEqual('1'.paddingStr( 3, '0', PADDING_RIGHT), '100');
        });
        it('應該符合往左補文字', function () {
            assert.deepEqual('1'.paddingStr( 3, '0', PADDING_LEFT), '001');
        });
    });

    describe('#paddingRight()', function () {
        it('應該符合往右補文字', function () {
            assert.deepEqual('1'.paddingRight(3, '0'), '100');
        });
    });

    describe('#paddingLeft()', function () {
        it('應該符合往左補文字', function () {
            assert.deepEqual('1'.paddingLeft(3, '0'), '001');
        });
    });

    describe('#padStart()', function () {
        it('應該符合往左補文字', function () {
            assert.deepEqual('1'.padStart(3, '0'), '001');
        });
    });

    describe('#padEnd()', function () {
        it('應該符合往右補文字', function () {
            assert.deepEqual('1'.padEnd(3, '0'), '100');
        });
    });
});

