const assert = require('assert').strict;
const path = require('path');
const {readFilesWithExts, filterExts} = require('../utils/skw-fs');

describe('utils/SkwFs', function () {


    describe('Array#filter with #filterExts()', function () {
        it('應該過濾單一指定副檔名陣列', function () {
            assert.deepEqual(
                ['a.js', 'b.js', 'test.md', 'test.txt', 'exclude_1.js', 'exclude_2.js'].filter(filterExts('.js')),
                ['a.js', 'b.js', 'exclude_1.js', 'exclude_2.js']
            );
        });
        it('應該過濾單一指定副檔名陣列，不包含除外清單', function () {
            assert.deepEqual(
                ['a.js', 'b.js', 'test.md', 'test.txt', 'exclude_1.js', 'exclude_2.js'].filter(filterExts('.js', ['exclude_1.js', 'exclude_2.js'])),
                ['a.js', 'b.js']
            );
        });
        it('應該過濾多個指定副檔名陣列，不包含除外清單', function () {
            assert.deepEqual(
                ['a.js', 'b.js', 'test.md', 'test.txt', 'exclude_1.js', 'exclude_2.js'].filter(filterExts(['.js', '.md'], ['exclude_1.js', 'exclude_2.js'])),
                ['a.js', 'b.js', 'test.md']
            );
        });
    })

    describe('#readFilesWithExts()', function () {
        it('應該取得單一指定副檔名檔案清單', function () {
            assert.deepEqual(
                readFilesWithExts(path.resolve(__dirname, 'fixtures/test_dir'), '.js'),
                ['a.js', 'b.js', 'exclude_1.js', 'exclude_2.js'],
            );
        });

        it('應該取得單一指定副檔名檔案清單，不包含除外清單', function () {
            assert.deepEqual(
                readFilesWithExts(path.resolve(__dirname, 'fixtures/test_dir'), '.js', ['exclude_1.js', 'exclude_2.js']),
                ['a.js', 'b.js']
            );
        });

        it('應該取得多個指定副檔名檔案清單，不包含除外清單', function () {
            assert.deepEqual(
                readFilesWithExts(path.resolve(__dirname, 'fixtures/test_dir'), ['.js', '.md'], ['exclude_1.js', 'exclude_2.js']),
                ['a.js', 'b.js', 'test.md']
            );
        });
    });
});
