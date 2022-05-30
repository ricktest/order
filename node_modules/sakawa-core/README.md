# sakawa-core

將 sakawa nodejs 專案的通用功能移除 global 綁定，統整為 package，可以透過 `npm install` 的方式安裝至專案的 `node_modules` 中

## 資料庫 `SakawaMysql`

包裝基本資料庫 SQL 操作的類別，會透過 `mysql2.createPool` 建立 pool，類別中各項查詢的方法內皆有使用 `clog` 實作 log 機制。


### 建立實體 `new SakawaMysql(config)`

* `config` \<object\> 基本與 `mysql2.createPool(options)` 相同，下面列出基本屬性
  * **下列屬於 `mysql2` options**:
  * `host` \<string\> mysql2 options 資料庫連線 host 。
  * `port` \<number\> 資料庫連線 port。 **預設:** `port`
  * `database` \<string\> 使用資料庫。
  * `user` \<string\> 使用者帳號。
  * `password` \<string\> 使用者密碼。
  * `charset` \<string\> 連線字符集。 **預設:** `'utf8mb4'`
  * `connectionLimit` \<number\> 連線數限制。 **預設:** `10`
  * `waitForConnections` \<boolean\> 設定當 pool 沒有可用的連線且到達限制數量後的動作。 設為 `true` 時， pool 會建立連線請求佇列，當有可用的連線時進行呼叫。 設為 `false` 時， pool 將會馬上回應執行 callback 傳入 error。  **預設:** `true`
  * `multipleStatements` \<boolean\> 執行一次 query 是否支援多個 SQL 語句。 **預設:** `false`
  * **下列屬於 `sakawa-core` 自定義 options**:
  * `show_clog` \<boolean\> 是否是用 clog 記錄資料庫操作。 **預設:** `true`

```javascript=
// path=/lib/db.js 檔案名稱可自訂

// 使用 Nodejs 開發指引的 config 機制
const config = require('./config');

//傳入的 options object，除了參數 show_clog 為自訂參數用於設定是否將查詢記錄透過 clog 顯示外，其於的參數可參照 mysql2.createPool https://github.com/sidorares/node-mysql2#using-connection-pools
const db = new SakawaMysql(config.db);

module.exports = db;
```

其他檔案可以透過 `require` 檔案來取得資料庫操作實體
```javascript=
const db = require('./lib/db');

//select , 與原先的 db.m_sql_select 操作模式類似，只是不用傳入 pool
let querySet = db.sql_query_set('table_name');
querySet.where = '`id` = '+db.escape(arg.id);
db.m_sql_select(querySet, function(success, results, fields) {
    //success select 結果數是否 > 0
    //results 為 mysql2 執行結果
    //fields 為 mysql2 執行結果欄位定義索引
});
```

:::danger
* `SakawaMysql` 內的 sql 操作 function 有內部定義的語法檢查，沒有依照格式規範建立產出的 SQL 可能會導致執行 query 錯誤。
* 要使用 db.escape() 處理脫逸字元。
  :::


### SQL Query `db.query(sql, callback, [log])`

* `sql` \<string\> 要執行的完整 SQL 語句。
* `callback` \<function\> pool 執行結果回呼函式，會依序傳入 `err`, `results`, `fields`
  * `err` \<`QueryError` | null\> 由 `mysql2` 定義的錯誤類別，當執行結果有錯誤時才會傳入，否則為 `null`
  * `results` \<`object[]` | `ResultSetHader` | `ResultSetHader`[] \> 由 `mysql2` 定義的類別。
  * `fields` \<`FieldPacket[]`\>  由 `mysql2` 定義的類別，欄位定義索引。
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`


當 `sql` 為 `SELECT` 語句時，`results` 為資料列物件陣列, `fields` 為 `FieldPacket[]`

當 `sql` 不為 `SELECT` 語句時， `results` 為 `ResultSetHader`, `fields` 為 `undefiend`


執行完整 SQL 語法，會呼叫 `mysql2DB.query(sql, callback)` ，內部有自定 callback 預處理執行結果後先呼叫 `conn.release()` 釋放連線後再呼叫傳入 `callback`。

`db.m_sql_select()`, `db.m_sql_insert()`, `db.m_sql_update()`, `db.m_sql_delete()`,  內部實作皆為產出對應的 SQL 語句後呼叫 `db.query(sql, callback)` 執行，各自有自定 callback 預處理執行結果後再呼叫傳入 `callback`。

傳入 `sql` 為單 SQL 語句時

```javascript=
//自訂 sql 查詢，與原先的 db.query 操作模式類似，只是不用傳入 pool
let sql = 'SELECT 1;'
db.query(sql, function(err, results, fields) {
    if (err) {
        console.log('錯誤');
        return;
    }
    // results: [{'1': 1}]
});
```

有開啟 `multipleStatements` 且傳入 `sql` 為多 SQL 語句時

```javascript=
//自訂 sql 查詢，與原先的 db.query 操作模式類似，只是不用傳入 pool
let sql = 'SELECT 1;SELECT 2;'
db.query(sql, function(err, results, fields) {
    if (err) {
        console.log('錯誤');
        return;
    }
    // results[0]: [{'1': 1}]
    // results[1]: [{'2': 2}]
});
```

### mysql2 類別 `ResultSetHeader`

執行非 SELECT 語句時於 `results` 回傳的值，下面列出較重要的屬性。

* `affectedRows` \<number\> 執行語法時影響的列數,
* `insertId` \<number\> 成功執行 INSERT 語句後的 insert id,
* `changedRows` \<number\> 執行更新語法時才會有的屬性，已變更的列數。

`affectedRows` 與 `affectedRows` 的差異在於 `changedRows` 不會計算欄位沒有變更的資料列，例如有下列資料表 `user`：

| id  | last_name | first_name |
| --- | --------- | ---------- |
| 1   | tsai      | todd       |
| 2   | tsai      | todd2       |

執行

```sql=
UPDATE user SET first_name = 'todd' WHERE last_name = 'tsai';
```

`affectedRows` = 2, `affectedRows` = 1
`affectedRows` 是符合 WHERE 條件的列數，`changedRows` 是資料有異動的列數。

### SELECT SQL 語法輔助物件 `db.sql_query_set(table_name)`

在執行 SELECT 語法前需要先透過 `db.sql_query_set` 建立 SELECT 輔助物件。

* `table_name` \<string\> 要 SELECT 的 table 名稱。
* return \<object\>
  * `table` \<string\> 要 SELECT 的 table 名稱。 **預設:** 傳入的 `table_name`。
  * `column` \<string | array\> 要 SELECT 的欄位，當屬性值不為字串或陣列時，會使用 `'*'`。 **預設:** `'*'`
  * `where` \<string\> SELECT `WHERE` 語句。 **預設:** `''`
  * `orderby` \<string\> SELECT `ORDER BY` 語句。  **預設:** `''`
  * `join` \<string\> SELECT `JOIN` 語句。 **預設:** `''`
  * `groupup` \<string\> SELECT `GROUP BY` 語句。 **預設:** `''`
  * `distinct` \<boolean\> 是否使用 `SELECT DISTINCT <column>` 語句。 **預設:** `true`
  * `page` \<number\> SELECT 設定 offset 個數，需要搭配 `querySet.max_row` 才有作用。 **預設:** `0`
  * `max_row` \<number\> SELECT 設定查詢最大筆數，參數值不為 `-1` 才有作用，會搭配 `querySet.max_row` 產出 SQL `LIMIT querySet.page, querySet.max_row` 語句 **預設:** `-1`


**`column`**

為陣列時會將所有陣列值前後加上 \` 並輸出為 SELECT column 語句，例如：

```javascript=
querySet.column = ['id', 'name'];
// 產出 '`id`, `name`'
```

為 \` 或 * 以及目前支援的 SQL FUNCTION (`COUNT`, `SUM`)開頭的字串時會直接以傳入的字串輸出 SELECT column 語句，否則會在前後加上 \` ，例如：

:::success

正確的語法。

```javascript=
querySet.column = '`id`, `name`';
// 產出 'SELECT `id`, `name` FROM `table`'
```
```javascript=
querySet.column = '*';
// 產出 'SELECT * FROM `table`'
```
```javascript=
querySet.column = 'SUM(point) AS sum_point, name';
// 產出 'SELECT SUM(POINT), name FROM `table`'
```
```javascript=
querySet.column = '`id`, name, SUM(point) AS sum_point';
// 產出 'SELECT `id`, name, SUM(POINT) AS sum_point FROM `table`'
```
:::

:::danger

錯誤的語法。

```javascript=
querySet.column = 'id, name';
// 產出 'SELECT `id, name` FROM `table`'
```
```javascript=
querySet.column = 'id, SUM(point) AS sum_point, name';
// 產出 'SELECT `id, SUM(POINT), name` FROM `table`'
```
:::

**`where`, `orderby`, `join`, `groupby`**

皆會直接以傳入的字串輸出。

```javascript=
querySet.where = 'id = 1 AND point > 0';
// 'SELECT * FROM `table` WHERE id = 1 AND point > 0';
```
```javascript=
querySet.orderby = 'id DESC, point ASC';
// 'SELECT * FROM `table` ORDER BY id DESC, point ASC';
```
```javascript=
querySet.groupby = 'id';
// 'SELECT * FROM `table` GROUP BY id';
```
```javascript=
querySet.join = 'JOIN table_b ON table_b.outer_id = table.id';
// 'SELECT * FROM `table` JOIN table_b ON table_b.outer_id = table.id';
```

**`page`, `max_row`**

設定結果最大筆數與offset，當 `max_row` !== -1 時才會有作用。

```javascript=
querySet.page = 0;
querySet.max_row = 20;
// 'SELECT * FROM `table` LIMIT 0, 20'
```
```javascript=
querySet.page = 20;
querySet.max_row = 20;
// 'SELECT * FROM `table` LIMIT 20, 20'
```

### SELECT 查詢 `db.m_sql_select(querySet, callback, [log])`

* `querySet` \<object\> 透過`db.sql_query_set(table_name)` 取得的輔助物件，請參照「SELECT SQL 語法輔助物件」。
* `callback` \<Function\> sql 執行後的結果回呼函式，會依序傳入 `success`, `results`, `fields`, `error`
  * `success` \<boolean\> 本次執行是否成功且 `results.length` > 0。
  * `results` \<object[]\> 以物件顯示的資料列陣列。
  * `fields` \<FieldPacket[]\> 由 `mysql2` 定義的類別，欄位定義索引。
  * `error` \<QueryError | null\> 由 `mysql2` 定義的錯誤類別，當執行結果有錯誤時才會傳入，否則為 `null`
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`

產出語法後呼叫 `db.query(sql, callback)` 執行，內部有自定 callback 預處理執行結果後再呼叫傳入 `callback`。

> 通常 nodejs 裡的 callback 設計模式會將 error 設定在第一個參數方便判定是否有發生錯誤，為了相容原始的 m_sql_* 操作以及將錯誤傳出外部，所以額外將 error 做為第4個參數傳出。

```javascript=

// 與原先的 db.m_sql_select 操作模式類似，只是不用傳入 pool
// 傳入要 select 的 table 名稱
let querySet = db.sql_query_set('table_name');
querySet.where = '`id` = '+db.escape(arg.id);
db.m_sql_select(querySet, function(success, results, fields, error) {
    if (success) {
        //執行成功且有結果
        results.forEach((row) => {
            console.log(row);
        });
    } else if (error) {
        //執行失敗
        console.log('錯誤發生');
    } else {
        //執行成功，但沒有結果
    }
});
```

### UPDATE 查詢 `db.m_sql_update(tableName, updateData, whereStr, callback, [log])`

* `tableName` \<string\> 要執行 UPDATE 的 table。
* `updateData` \<object\> 要更新的資料欄位及欄位值物件。
* `whereStr` \<string\> 更新的 WHERE 語句。
* `callback` \<Function\> sql 執行後的結果回呼函式，會依序傳入 `success`, `results`, `fields`, `error`
  * `success` \<boolean\> 本次執行是否成功且 `results.affectedRows` > 0。
  * `results` \<ResultSetHeader\> 由 `mysql2` 定義的類別。
  * `fields` \<undefined\> 執行 UPDATE 語法時此參數皆為 undefined。
  * `error` \<QueryError | null\> 由 `mysql2` 定義的錯誤類別，當執行結果有錯誤時才會傳入，否則為 `null`
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`

產出語法後呼叫 `db.query(sql, callback)` 執行，內部有自定 callback 預處理執行結果後再呼叫傳入 `callback`。


```javascript=
//與原先的 db.m_sql_update 操作模式類似，只是不用傳入 pool, database_name
let updateData = {name: 'todd', point: 2};
let whereStr = '`id` = '+db.escape(arg.id);
db.m_sql_update('table_name', updateData, whereStr, function(success, results, fields, error) {
    if (success) {
        //執行成功且有資料列符合更新條件
        //results.changedRows 資料有變動的列數
        //results.affectedRows 符合更新條件的列數
    } else if (error) {
        //執行失敗
        console.log('錯誤發生');
    } else {
        //執行成功，但沒有資料列符合更新條件
    }
});
```

### INSERT 查詢 `db.m_sql_insert(tableName, insertData, callback, [log])`

* `tableName` \<string\> 要執行 INSERT 的 table。
* `insertData` \<object\> 要新增的資料欄位及欄位值物件。
* `callback` \<Function\> sql 執行後的結果回呼函式，會依序傳入 `success`, `results`, `fields`, `error`
  * `success` \<boolean\> 本次執行是否成功且 `results.affectedRows` > 0。
  * `results` \<ResultSetHeader\> 由 `mysql2` 定義的類別。
  * `fields` \<undefined\> 執行 INSERT 語法時此參數皆為 undefined。
  * `error` \<QueryError | null\> 由 `mysql2` 定義的錯誤類別，當執行結果有錯誤時才會傳入，否則為 `null`
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`

產出語法後呼叫 `db.query(sql, callback)` 執行，內部有自定 callback 預處理執行結果後再呼叫傳入 `callback`。


```javascript=
//insert , 與原先的 db.m_sql_insert 操作模式類似，只是不用傳入 pool, database_name
let insertData = {name: 'todd', point: 1}
db.m_sql_insert('table_name', insertData, function(success, results, fields, error) {
    if (success) {
        //執行成功且有新增資料
        //results.insertId 新增資料列的 id
    } else if (error) {
        //執行失敗
        console.log('錯誤發生');
    } else {
        //執行成功，但沒有新增資料，這個條件區塊應該是不會發生。
    }
});
```

### DELETE 查詢 `db.m_sql_delete(tableName, whereStr, callback, [log])`

* `tableName` \<string\> 要執行 DELETE 的 table。
* `whereStr` \<string\> 刪除的 WHERE 語句。
* `callback` \<Function\> sql 執行後的結果回呼函式，會依序傳入 `success`, `results`, `fields`, `error`
  * `success` \<boolean\> 本次執行是否成功且 `results.affectedRows` > 0。
  * `results` \<ResultSetHeader\> 由 `mysql2` 定義的類別。
  * `fields` \<undefined\> 執行 INSERT 語法時此參數皆為 undefined。
  * `error` \<QueryError | null\> 由 `mysql2` 定義的錯誤類別，當執行結果有錯誤時才會傳入，否則為 `null`
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`

產出語法後呼叫 `db.query(sql, callback)` 執行，內部有自定 callback 預處理執行結果後再呼叫傳入 `callback`。


```javascript=

//delete , 與原先的 db.m_sql_delete 操作模式類似，只是不用傳入 pool, database_name
let whereStr = '`id` = '+db.escape(arg.id);
db.m_sql_delete('table_name', whereStr, function(success, results, fields, error) {
    if (success) {
        //執行成功且至少刪除一筆資料
        //results.affectedRows 刪除資料列數。
    } else if (error) {
        //執行失敗
        console.log('錯誤發生');
    } else {
        //執行成功，但沒有資料被刪除。
    }
});
```

### db.m_sql_* callback 中的 success, error 參數

success 參數設計的用意是簡化各查詢情境下最終要判定的執行結果。

一般 nodejs 裡的 callback 設計模式會將 error 設定在第一個參數方便判定是否有發生錯誤，為了達到兼容原先 m_sql_* 系列的呼叫以及將錯誤傳入 callback，所以額外將 error 做為第4個參數傳出。

### Promise 包裝執行查詢

`db.query()` 與 `db.m_sql_*` 都有各自非同步操作的版本，內部簡易以 `Promise` 進行實作，呼叫後立即返回一個 `Promise`，當查詢發生錯誤時會觸發 reject。

### Promise 包裝 SQL Query `db.n_query(sql, [log])`

* `sql` \<string\> 要執行的完整 SQL 語句。
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`
* Returns: \<Promise\> 當執行結果成功，
  * resolve: 執行結果成功，會回傳一個陣列，陣列值依序為 `results`, `fields`。
  * reject: 執行結果錯誤，會回傳 `QueryError`。

`db.query()` 的 `Promise` 包裝版本。

```javascript=
//非同步 自訂 sql 查詢，與原先的 db.n_query 操作模式類似，只是不用傳入 pool
db.n_query(sql).then(function([results, fields]) {
    
}).catch((error) => {
    //sql 錯誤時會 reject
});
```

或 await 模式

```javascript=
try {
    const [results, fields] = await db.n_query(sql);
} catch (e) {
    //sql 錯誤時會 reject
}
```

### Promise 包裝 SELECT 查詢 `db.n_sql_select(querySet, [log])`

* `querySet` \<object\> 透過`db.sql_query_set(table_name)` 取得的輔助物件，請參照「SELECT SQL 語法輔助物件」。
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`
* Returns: \<Promise\> 當執行結果成功，
  * resolve: 執行結果成功，會回傳一個陣列，陣列值依序為 `success`, `results`, `fields`。
  * reject: 執行結果錯誤，會回傳 `QueryError`。

`db.m_sql_select()` 的 `Promise` 包裝版本。


```javascript=
// 與原先的 db.n_sql_select 操作模式類似，只是不用傳入 pool
// 傳入要 select 的 table 名稱
let querySet = db.sql_query_set('table_name');
querySet.where = '`id` = '+db.escape(arg.id);
db.n_sql_select(querySet).then([success, results, fields]) {
    if (success) {
        //執行成功且有結果
        results.forEach((row) => {
            console.log(row);
        });
    } else {
        //執行成功，但沒有結果
    }
}).catch((error) => {
    //sql 錯誤時會 reject
});
```

或 await 模式

```javascript=
let querySet = db.sql_query_set('table_name');
querySet.where = '`id` = '+db.escape(arg.id);
try {
    const [success, results, fields] = await db.n_sql_select(querySet);
} catch (e) {
    //sql 錯誤時會 reject
}
```

### Promise 包裝 UPDATE 查詢 `db.n_sql_update(tableName, updateData, whereStr, [log])`

* `tableName` \<string\> 要執行 UPDATE 的 table。
* `updateData` \<object\> 要更新的資料欄位及欄位值物件。
* `whereStr` \<string\> 更新的 WHERE 語句。
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`
* Returns: \<Promise\> 當執行結果成功，
  * resolve: 執行結果成功，會回傳一個陣列，陣列值依序為 `success`, `results`, `fields`。
  * reject: 執行結果錯誤，會回傳 `QueryError`。

`db.m_sql_update()` 的 `Promise` 包裝版本。

```javascript=
// 與原先的 db.n_sql_update 操作模式類似，只是不用傳入 pool, database_name
let updateData = {name: 'todd', point: 2};
let whereStr = '`id` = '+db.escape(arg.id);
db.n_sql_update('table_name', updateData, whereStr).then([success, results, fields]) {
    if (success) {
        //執行成功且有資料列符合更新條件
        //results.changedRows 資料有變動的列數
        //results.affectedRows 符合更新條件的列數
    } else {
        //執行成功，但沒有資料列符合更新條件
    }
}).catch((error) => {
    //sql 錯誤時會 reject
});
```

或 await 模式

```javascript=
let updateData = {name: 'todd', point: 2};
let whereStr = '`id` = '+db.escape(arg.id);
try {
    const [success, results, fields] = await db.n_sql_update('table_name', updateData, whereStr);
} catch (e) {
    //sql 錯誤時會 reject
}
```

### Promise 包裝 INSERT 查詢 `db.n_sql_insert(tableName, insertData, [log])`

* `tableName` \<string\> 要執行 INSERT 的 table。
* `insertData` \<object\> 要新增的資料欄位及欄位值物件。
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`
* Returns: \<Promise\> 當執行結果成功，
  * resolve: 執行結果成功，會回傳一個陣列，陣列值依序為 `success`, `results`, `fields`。
  * reject: 執行結果錯誤，會回傳 `QueryError`。

`db.m_sql_insert()` 的 `Promise` 包裝版本。

```javascript=
// 與原先的 db.n_sql_insert 操作模式類似，只是不用傳入 pool, database_name
let insertData = {name: 'todd', point: 2};
db.n_sql_insert('table_name', insertData).then([success, results, fields]) {
    if (success) {
        //執行成功且有新增資料
        //results.insertId 新增資料列的 id
    } else {
        //執行成功，但沒有新增資料，這個條件區塊應該是不會發生。
    }
}).catch((error) => {
    //sql 錯誤時會 reject
});
```

或 await 模式

```javascript=
let insertData = {name: 'todd', point: 2};
try {
    const [success, results, fields] = await db.n_sql_insert('table_name', insertData);
} catch (e) {
    //sql 錯誤時會 reject
}
```

### Promise 包裝 DELETE 查詢 `db.n_sql_delete(tableName, whereStr, [log])`

* `tableName` \<string\> 要執行 DELETE 的 table。
* `whereStr` \<string\> 刪除的 WHERE 語句。
* `log` \<boolean\> 該次動作是否進行 log，會先判定此參數再判定建構時傳入的 `show_clog` 參數 **預設:** `true`
* Returns: \<Promise\> 當執行結果成功，
  * resolve: 執行結果成功，會回傳一個陣列，陣列值依序為 `success`, `results`, `fields`。
  * reject: 執行結果錯誤，會回傳 `QueryError`。

`db.m_sql_delete()` 的 `Promise` 包裝版本。

```javascript=
// 與原先的 db.n_sql_delete 操作模式類似，只是不用傳入 pool, database_name
let whereStr = '`id` = '+db.escape(arg.id);
db.n_sql_delete('table_name', whereStr).then([success, results, fields]) {
    if (success) {
        //執行成功且至少刪除一筆資料
        //results.affectedRows 刪除資料列數。
    } else {
        //執行成功，但沒有資料被刪除。
    }
}).catch((error) => {
    //sql 錯誤時會 reject
});
```

或 await 模式

```javascript=
let whereStr = '`id` = '+db.escape(arg.id);
try {
    const [success, results, fields] = await db.n_sql_delete('table_name', whereStr);
} catch (e) {
    //sql 錯誤時會 reject
}
```

## clog

在程式進入點初始化

```javascript=
const config = require('./lib/config');
const logger = require('sakawa-core/hdl-logger');
const {orig_console_log, clog, overwriteConsoleLog} = logger;
const dbLogger = require('sakawa-core/database/db-logger');

//初始化
//可自訂寫入資料庫 log 記錄的 server_name, 預設使用 os.hostname();
//dbLogger.serverName = config.server_name;
//設定 clog 用資料庫
dbLogger.initSkwMysql(config.log.db_log);
//指定 logger 使用
logger.db_callback = dbLogger.write_server_ap_log.bind(dbLogger);
// 覆蓋 console.log 為 clog, 第一個參數為傳入物件時序列化時的解構層數，第二個參數為輸出是否帶顏色
overwriteConsoleLog(3, false);
//開始輪詢 nlog 或 rotate，如果 config 有設定的話
logger.start(config.log);


clog('log message');

//原始 console.log
orig_console_log('log message');
```

> 初始化的流程需要再優化，減少手動執行的行數。


## osInfo

```javascript=
const osInfo = require('sakawa-core/os-info');


//啟用輪詢 timer 自動更新 os-info
osInfo.startUpdate();
//停止輪詢 timer
//osInfo.stopUpdate();

// 當 os-info 更新時會觸發 update 事件，可自訂後續處理
osInfo.on('update', (system_status, online_stst) => {
    //每X秒送出 clog (cpu,momory)
});
```

## 其他 module

```javascript=

const {http_request, http_request_2} = require('sakawa-core/utils/api-post');
const {gss, gsd, getInt2Str, getRandomInt, makeid, makeId, makeToken, m_sql_time, m_sql_time_2, m_sql_time_3, m_sql_display_time, get_datetime, get_key_by_value, paddingStr, paddingLeft, paddingRight, shuffle_array, getRandom, mix_num_char, generate_cmd_key} = require('sakawa-core/utils/common');
// makeid === makeId === makeToken

```
