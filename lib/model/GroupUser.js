const db = require('../my-db');
const sqlGroupUser = require('../sql/GroupUser/sqlGroupUser');

class GroupUser{

    constructor(){
        this.sqlPromise;
        this.tableName = 'group_user';
    }

    selectGroupUser(sqlMethod,sqlData){
        
        const sqlSet = sqlGroupUser[sqlMethod](sqlData);
        this.sqlPromise = db.n_sql_select(sqlSet);
        return this.sqlPromise;
    }

    createGroupUser(groupData){
        this.sqlPromise = db.n_sql_insert(this.tableName, groupData);
        return this.sqlPromise;
    }

    deleteGroupUser(whereStr){

        this.sqlPromise = db.n_sql_delete(this.tableName, whereStr);
        return this.sqlPromise;
        
    }
}
module.exports = GroupUser;