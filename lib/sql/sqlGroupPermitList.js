const db = require('../my-db');

const sqlGroupPermitList = {

    "Select": function( sqlData ){
        let sql_query_set = db.sql_query_set('group_permit_list');
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.id ? ` AND \`id\` = ${db.escape(sqlData.id)}`:'';
        sql_query_set.where += sqlData.uid ? ` AND \`uid\` = ${db.escape(sqlData.uid)}`:'';
        sql_query_set.where += sqlData.group_id ? ` AND \`group_id\` = ${db.escape(sqlData.group_id)}` : '';
        sql_query_set.where += sqlData.is_accept ? ` AND \`is_accept\` = ${db.escape(sqlData.is_accept)}` : '';
        
        return sql_query_set;
    },
    "JoinGroupList": function( sqlData ){
        let sql_query_set = db.sql_query_set('group_permit_list');
        sql_query_set.join = 'JOIN group_list ON group_list.id = group_permit_list.group_id';
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.id ? ` AND group_permit_list.\`id\` = ${db.escape(sqlData.id)}`:'';
        sql_query_set.where += sqlData.uid ?` AND group_permit_list.\`uid\` = ${db.escape(sqlData.uid)}` : '';
        sql_query_set.where += sqlData.group_id ? ` AND group_permit_list.\`group_id\` = ${db.escape(sqlData.group_id)}` : '';
        sql_query_set.where += sqlData.is_accept ? ` AND group_permit_list.\`is_accept\` = ${db.escape(sqlData.is_accept)}` :'';
        return sql_query_set;
    },
    "JoinGroupUser": function( sqlData ){
        let sql_query_set = db.sql_query_set('group_permit_list');
        sql_query_set.column = '`group_permit_list`.`group_id` as group_id,`group_permit_list`.`uid` as uid';
        sql_query_set.join = 'JOIN group_user ON group_user.group_id = group_permit_list.group_id';
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.id ? ` AND group_permit_list.\`id\` = ${db.escape(sqlData.id)}`:'';
        sql_query_set.where += sqlData.uid ?` AND group_permit_list.\`uid\` = ${db.escape(sqlData.uid)}` : '';
        sql_query_set.where += sqlData.group_id ? ` AND group_permit_list.\`group_id\` = ${db.escape(sqlData.group_id)}` : '';
        sql_query_set.where += sqlData.is_accept ? ` AND group_permit_list.\`is_accept\` = ${db.escape(sqlData.is_accept)}` :'';
        return sql_query_set;
    },
    "JoinAccountList": function( sqlData ){
        let sql_query_set = db.sql_query_set('group_permit_list');
        sql_query_set.column = '`name`,`group_permit_list`.`currenttime` as date,`group_permit_list`.`id` as id';
        sql_query_set.join = 'JOIN account_list ON account_list.id = group_permit_list.uid';
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.id ? ` AND group_permit_list.\`id\` = ${db.escape(sqlData.id)}`:'';
        sql_query_set.where += sqlData.uid ?` AND group_permit_list.\`uid\` = ${db.escape(sqlData.uid)}` : '';
        sql_query_set.where += sqlData.group_id ? ` AND group_permit_list.\`group_id\` = ${db.escape(sqlData.group_id)}` : '';
        sql_query_set.where += sqlData.is_accept ? ` AND group_permit_list.\`is_accept\` = ${db.escape(sqlData.is_accept)}` :'';
        console.log(sql_query_set);
        return sql_query_set;
    },
};
module.exports = sqlGroupPermitList;