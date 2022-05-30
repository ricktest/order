const assert = require('assert').strict;
const path = require('path');

describe('native path', function () {
    describe('#dirname()', function () {
        it('應該取得傳入檔案路徑的完整資料夾路徑', function () {
            assert.equal(path.dirname('/dir/sub_dir/file.js'), '/dir/sub_dir');
        });
    });

    describe('#extname()', function () {
        it('應該取得副檔名 .js', function () {
            assert.equal(path.extname('/dir/sub_dir/file.js'), '.js');
        });

        it('應該取得副檔名 .md', function () {
            assert.equal(path.extname('/dir/sub_dir/file.js.md'), '.md');
        });

        it('應該取得副檔名 空字串', function () {
            assert.equal(path.extname('/dir/sub_dir/file'), '');
        });

        it('應該取得副檔名 空字串', function () {
            assert.equal(path.extname('/dir/sub_dir/.file'), '');
        });

        it('傳入參數不為字串會拋錯', function () {
            assert.throws(() => {
                //傳入參數不為字串會拋錯
                path.extname({});
            }, TypeError);
        });
    });

    describe('#basename()', function () {
        it('應該取得基本名稱 js', function () {
            assert.equal(path.basename('/js'), 'js');
        });
    });
})

