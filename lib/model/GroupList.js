const db = require('../my-db');
const sqlGroupList = require('../sql/GroupList/sqlGroupList');

class GroupList{

    constructor(){
        this.sqlPromise;
        this.tableName = 'group_list';
    }

    selectGroupList(sqlMethod,sqlData){
        
        const sqlSet = sqlGroupList[sqlMethod](sqlData);
        
        this.sqlPromise = db.n_sql_select(sqlSet);
        return this.sqlPromise;
    }

    createGroupList(groupData){
        this.sqlPromise = db.n_sql_insert(this.tableName, groupData);
        return this.sqlPromise;
    }

    updateGroupList(updateData,whereStr){
        this.sqlPromise = db.n_sql_update(this.tableName, updateData, whereStr);
        return this.sqlPromise;
    }
    
    /*getInsertId(cb){

        this.sqlPromise.then(([success, results, fields])=>{

            if(success){
                cb(results.insertId);
            }else{
                cb(results.insertId);
            }

        })
    }

    selectSingle(cb){

        this.sqlPromise.then(([success, results, fields])=>{

            if(success){
                cb(results[0]);
            }else{
                cb(false);
            }

        })

    }

    selectList(cb){

        this.sqlPromise.then(([success, results, fields])=>{

            if(success){
                cb(results);
            }else{
                cb(false);
            }

        })

    }*/
}
module.exports = GroupList;