const assert = require('assert').strict;
const {m_sql_time, getInt2Str, m_sql_time_2, m_sql_time_3, get_datetime, m_sql_display_time} = require('../utils/common');

describe('utils/common', function () {
    describe('取得時間格式相關 functions', function () {
        const now = new Date();

        const year = now.getUTCFullYear();
        const month = getInt2Str(now.getUTCMonth() + 1, 2);
        const date = getInt2Str(now.getUTCDate(), 2);
        const hour = getInt2Str(now.getUTCHours(), 2);
        const min = getInt2Str(now.getUTCMinutes(), 2);
        const sec = getInt2Str(now.getUTCSeconds(), 2);

        const exceptUtcDateStr = `${year}-${month}-${date} ${hour}:${min}:${sec}`;

        const localeYear = now.getFullYear();
        const localeMonth = getInt2Str(now.getMonth() + 1, 2);
        const localeDate = getInt2Str(now.getDate(), 2);
        const localeHour = getInt2Str(now.getHours(), 2);
        const localeMin = getInt2Str(now.getMinutes(), 2);
        const localeSec = getInt2Str(now.getSeconds(), 2);

        const exceptLocalDateStr = `${localeYear}-${localeMonth}-${localeDate} ${localeHour}:${localeMin}:${localeSec}`;

        describe('#m_sql_time()', function () {
            it('應該取得 UTC 時間，格式: YYYY-MM-DD HH:mm:ss', function () {
                assert.deepEqual(m_sql_time(now), exceptUtcDateStr);
            });
        });

        describe('#m_sql_time_2()', function () {
            it(' 應該取得 UTC 時間，格式: YYYY-MM-DD HH:mm:ss', function () {
                assert.deepEqual(m_sql_time_2(now), exceptUtcDateStr);
            });
        });

        describe('#m_sql_time_3()', function () {

            it('應該取得 UTC 時間，格式: YYYY-MM-DD HH:mm:ss', function () {
                assert.deepEqual(m_sql_time_3(now), exceptLocalDateStr);
            });
        });

        describe('#get_datetime()', function () {
            it('應該取得系統 local 時間，格式: YYYYMMDDHHmmss', function () {
                assert.deepEqual(get_datetime(now), `${localeYear}${localeMonth}${localeDate}${localeHour}${localeMin}${localeSec}`);
            });
        });

        describe('#m_sql_display_time()', function () {
            it('應該取得系統 local 時間，格式: YYYY/MM/DD HH:mm:ss', function () {
                assert.deepEqual(m_sql_display_time(now), `${localeYear}/${localeMonth}/${localeDate} ${localeHour}:${localeMin}:${localeSec}`);
            });
        });
    });
})
