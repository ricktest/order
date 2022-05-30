const db = require('../../my-db');

const sqlGroupList = {

    "Select": function( sqlData ){

        let sql_query_set = db.sql_query_set('group_list');
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.token ?` AND \`token\` = ${db.escape(sqlData.token)}` : '';
        sql_query_set.where += sqlData.groupName?` AND \`group_name\` = ${db.escape(sqlData.groupName)}`:'';
        sql_query_set.where += sqlData.uid?` AND \`uid\` = ${db.escape(sqlData.uid)}`:'';
        sql_query_set.where += sqlData.id?` AND \`id\` = ${db.escape(sqlData.id)}`:'';
        
        return sql_query_set;
    },
    
    "SelectOwn": function( sqlData ){

        let sql_query_set = db.sql_query_set('group_list');
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.token ?` AND \`token\` = ${db.escape(sqlData.token)}` : '';
        sql_query_set.where += sqlData.groupName?` AND \`group_name\` = ${db.escape(sqlData.groupName)}`:'';
        sql_query_set.where += sqlData.uid?` AND \`uid\` = ${db.escape(sqlData.uid)}`:'';
        
        return sql_query_set;
    },

    "SelectOther": function( sqlData ){

        let sql_query_set = db.sql_query_set('group_list');
        sql_query_set.where = ' 1 ';
        sql_query_set.where += sqlData.token ?` AND \`token\` = ${db.escape(sqlData.token)}` : '';
        sql_query_set.where += sqlData.groupName?` AND \`group_name\` = ${db.escape(sqlData.groupName)}`:'';
        sql_query_set.where += sqlData.uid?` AND \`uid\` != ${db.escape(sqlData.uid)}`:'';
        
        return sql_query_set;
    },

    "JoinGroupUser": function( sqlData ){

        let sql_query_set = db.sql_query_set('group_list');
        sql_query_set.join = 'JOIN group_user ON group_user.group_id = group_list.id';
        sql_query_set.where = ' 1 ';
        sql_query_set.where += typeof sqlData.uid === 'undefined' ?'' : ` AND group_user.\`uid\` = ${db.escape(sqlData.uid)}`;
        sql_query_set.where += typeof sqlData.level === 'undefined'?'' : ` AND group_user.\`level\` = ${db.escape(sqlData.level)}`;
        
        console.log('JoinGroupUser',sql_query_set);
        return sql_query_set;
    },
};
module.exports = sqlGroupList;