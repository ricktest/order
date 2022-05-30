const db = require('../../my-db');

const sqlGroupUser = {
    
    "Select": function( sqlData ){
        let sql_query_set = db.sql_query_set('group_user');
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.id  ?` AND \`id\` = ${db.escape(sqlData.id)}` :'' ;
        sql_query_set.where += sqlData.uid  ?` AND \`uid\` = ${db.escape(sqlData.uid)}` :'' ;
        sql_query_set.where += sqlData.group_id ?` AND \`group_id\` = ${db.escape(sqlData.group_id)}` :'' ;
        sql_query_set.where += sqlData.level ?` AND \`level\` = ${db.escape(sqlData.level)}` :'' ;
        
        return sql_query_set;
    },

    "joinaccount_list": function( sqlData ){
        
        let sql_query_set = db.sql_query_set('group_user');
        sql_query_set.where = ' 1 ';
        sql_query_set.join = 'JOIN account_list ON account_list.id = group_user.uid';
        sql_query_set.column = '`group_user`.`id` as group_user_id,`account_list`.`name` as name,`account_list`.`point` as point';

        sql_query_set.where += sqlData.uid  ?` AND group_user.\`uid\` = ${db.escape(sqlData.uid)}` :'' ;
        sql_query_set.where += sqlData.group_id ?` AND group_user.\`group_id\` = ${db.escape(sqlData.group_id)}` :'' ;
        sql_query_set.where += sqlData.level ?` AND group_user.\`level\` = ${db.escape(sqlData.level)}` :'' ;
        
        return sql_query_set;
    },
};
module.exports = sqlGroupUser;