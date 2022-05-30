const db = require('../my-db');
const sqlGroupList = require('../sql/sqlGroupPermitList');

class GroupPermitList{

    constructor(){
        this.sqlPromise;
        this.tableName = 'group_permit_list';
    }

    selectGroupPermitList(sqlMethod,sqlData){

        const sqlSet = sqlGroupList[sqlMethod](sqlData);
        this.sqlPromise = db.n_sql_select(sqlSet);
        return this.sqlPromise;
    }

    createGroupPermitList(GroupPermitData){
        this.sqlPromise = db.n_sql_insert(this.tableName, GroupPermitData)
        return this.sqlPromise;
    }

    updateGroupPermitList(updateData,whereStr){
        this.sqlPromise = db.n_sql_update(this.tableName, updateData, whereStr);
        return this.sqlPromise;
    }

    deleteGroupPermitList(whereStr){
        this.sqlPromise = db.n_sql_delete(this.tableName, whereStr);
        return this.sqlPromise;
    }
}
module.exports = GroupPermitList;