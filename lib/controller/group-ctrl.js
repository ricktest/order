const path = require('path')
const TokenGenerator = require('uuid-token-generator');
const db = require('../my-db');
const GroupList = require('../model/GroupList');
const GroupUser = require('../model/GroupUser');
const GroupPermitList = require('../model/GroupPermitList');
const groupListModel = new GroupList();
const groupUserModel = new GroupUser();
const groupPermitListModel = new GroupPermitList();
//建立群組
async function groupcreate(req, res) {

    if(!req.session.user) return  res.json({status:'fail',msg:'未登入'});

        if( checkGroupCreate(req.body.groupName).status === 'fail'){
            return res.json(checkGroupCreate(req.body.groupName));
        }
        
        const [success, results, fields] = await groupListModel.selectGroupList('Select',{groupName:req.body.groupName});

        if(success) return  res.json({status:'fail',msg:'群組名稱重複'});
        
        const tokgen = new TokenGenerator(128, TokenGenerator.BASE64);
        let groupData = {
            'group_name':req.body.groupName,
            'uid':req.session.user.id,
            'token':tokgen.generate(),
        }

        const [success2, results2, fields2] = await groupListModel.createGroupList(groupData);

        if(success2){

            let groupUserData = {
                'uid':req.session.user.id,
                'group_id':results2.insertId,
                'level':'1'
            }

            const [success3, results3, fields3] = await groupUserModel.createGroupUser(groupUserData);
            if(success3) return res.json({status:'ok',msg:'建立成功'});
        }
        
    return;
}

//顯示群組
async function groupList(req, res){
    
    if(!req.session.user) return  res.json({status:'fail',msg:'未登入'});

        switch(req.body.type){

            case 'own':
                const [success, results, fields] = await groupListModel.selectGroupList('SelectOwn',{uid:req.session.user.id});
                return res.json({status:'ok',msg:results});
                break;

            case 'other':
                const [success2, results2, fields2] = await groupListModel.selectGroupList('SelectOther',{uid:req.session.user.id});
                return res.json({status:'ok',msg:results2});
                break;
            default:
                return res.json({status:'fail',msg:'未定義type'});
                break;
        }
}

//驗證申請名單按鈕
function checkLevelBtn(req, res){

    if(!req.session.user) return res.json({status:'fail',msg:'未登入'});
    const levelPromise = checklevel(req.body.group_id,req.session.user.id);
    levelPromise.then((levelData)=>{
        if(levelData.status==='fail') return res.json({status:'fail',msg:'你沒有此權限'});
        return res.json({status:'ok',msg:'驗證通過',link:'./admin'});
    });
   
}

//顯示群組人員
async function groupContent(req, res){

    if(!req.session.user) return res.json({status:'fail',msg:'未登入'});
    if( req.body.group_id ==='' || typeof req.body.group_id === 'undefined' ) return {'status':'fail','msg':'group_id 未定義'};
    const [success, results, fields] =  await groupUserModel.selectGroupUser('joinaccount_list',{group_id:req.body.group_id});
    return res.json({status:'ok',msg:results});
}

//token更新
function updateToken(req, res){

    if(!req.session.user) return res.json({status:'fail',msg:'未登入'});
    if( req.body.group_id ==='' || typeof req.body.group_id === 'undefined' ) return res.json({'status':'fail','msg':'group_id 未定義'});

    const levelPromise = checklevel(req.body.group_id,req.session.user.id);
    levelPromise.then(async (levelData)=>{
        if(levelData.status==='fail') return res.json({status:'fail',msg:'你沒有此權限'});
        const tokgen = new TokenGenerator(128, TokenGenerator.BASE64);
        let groupData = {
            'token':tokgen.generate(),
        }
        let whereStr = '`id` = '+db.escape(req.body.group_id);
        const [success, results, fields]  = await groupListModel.updateGroupList(groupData,whereStr);
        if(success) res.json({status:'ok',msg:'更新成功'});
    });

}

//驗證群組等級
async function checklevel(group_id,uid){
    const [success, results, fields] = await groupListModel.selectGroupList('Select',{uid:uid,id:group_id});
    if(!success) return {status:'fail',msg:'你沒有此權限'};
    return {status:'ok',msg:'驗證通過'};
}
//接受人員

async function acceptAccount(req, res){
    //驗證是否登入
    if(!req.session.user.id) return res.json({status:'fail',msg:'未登入'});
    //驗證前端form
    if(!req.body.group_permit_list_id) return res.json({status:'fail',msg:'未定義group_permit_list_id'});
    //驗證 更新group_permit_list group_id 與 group_list uid 是否有權限
    const [sus,groupPermit,feilds] = await groupPermitListModel.selectGroupPermitList('JoinGroupUser',{id:req.body.group_permit_list_id,is_accept:'0'});
    if(!sus) return res.json({status:'fail',msg:'找不到加入人員'});
    const levelPromise = checklevel( groupPermit[0].group_id,req.session.user.id);
    //if( groupPermit[0].level!=='1' ) return res.json({status:'fail',msg:'你沒有此權限'});
    
    levelPromise.then(async (levelData)=>{
        if(levelData.status==='fail') return res.json({status:'fail',msg:'你沒有此權限'});
         //更新group_permit_list is accept
        let updateData = {
            is_accept:1
        }
        let whereStr = '`id` = '+db.escape(req.body.group_permit_list_id);
        const [upsus,groupPermitUpdate,feilds2] = await groupPermitListModel.updateGroupPermitList(updateData,whereStr);
        if(!upsus) return res.json({status:'fail',msg:'更新失敗'});
        //插入groupuser
        let groupUserData = {
            'uid':groupPermit[0].uid,
            'group_id':groupPermit[0].group_id,
            'level':'3'
        }
        
        const [success3, results3, fields3] = await groupUserModel.createGroupUser(groupUserData);
        if(success3) return res.json({status:'ok',msg:'成功'});
        return res.json({status:'ok',msg:'失敗'});
    });
   
    
}

// 處理群組接受名單
async function acceptHandle(req,res){

    let returnData = {
        token:'',
        status:'',
        msg:'',
        result:''
    };

    if(!req.session.user) return res.json({status:'fail',msg:'未登入'});
    if(!req.body.group_id) return res.json({status:'fail',msg:'未定義group_id'});
    const [groupListSus,groupListData,groupListFeilds] = await groupListModel.selectGroupList('Select',{id:req.body.group_id});
    if(!groupListSus) return res.json({status:'fail',msg:'沒找到群組'});
    const levelPromise = checklevel(req.body.group_id,req.session.user.id);
    levelPromise.then( async (arg)=>{
        if(arg.status==='fail') return res.json({status:'fail',msg:'你沒有此權限'});
        returnData.token = groupListData[0].token;
        const [groupPermitListSus,groupPermitListData,groupLPermitListFeilds] = await groupPermitListModel.selectGroupPermitList('JoinAccountList',{group_id:req.body.group_id,is_accept:'0'}); 
        returnData.status = 'ok';
        returnData.msg = '';
        returnData.result = groupPermitListData;
        return res.json(returnData);
    });
   
}
//踢除人員
async function deleteUser(req,res){

    if(!req.session.user) return res.json({status:'fail',msg:'未登入'});
    if(!req.body.group_user_id) return res.json({status:'fail',msg:'未定義group_user_id'});
    const [groupUsersus,groupUserData,groupUserFelid] = await groupUserModel.selectGroupUser('Select',{id:req.body.group_user_id});
    if(!groupUsersus) return res.json({status:'fail',msg:'沒有找到user'});
    const levelPromise = checklevel(groupUserData[0].group_id,req.session.user.id);
    levelPromise.then( async (arg)=>{

        if(arg.status==='fail') return res.json({status:'fail',msg:'你沒有此權限'});
        if( groupUserData[0].level === 1) return res.json({status:'fail',msg:'無法踢除管理者'});
        //console.log(groupUserData[0]);
        let groupPermitListwhereStr = '`group_id` = '+db.escape(groupUserData[0].group_id)+' AND `uid` = '+db.escape(groupUserData[0].uid);
        const [groupPermitListSus,groupPermitListData,groupPermitListFelid] = await groupPermitListModel.deleteGroupPermitList(groupPermitListwhereStr);
        let groupUserwhereStr = '`id` = '+db.escape(req.body.group_user_id);
        const [success,results,fields] = await groupUserModel.deleteGroupUser(groupUserwhereStr);
        if(success) return res.json({status:'ok',msg:'踢除成功'});
        return res.json({status:'fail',msg:'踢除失敗'});

    });
}

function checkGroupCreate(groupNname){

    if(groupNname ===''){
        return {'status':'fail','msg':'請輸入群組名稱'};
    }
    return {'status':'ok'};
}

function grouplistView(req, res) {

    if(req.session.user){
        res.sendFile(path.join(__dirname, '../view/grouplist.html'));
        return;
    }

    res.redirect('./login');
    return;
}

function groupcreateView(req, res) {

    if(req.session.user){
        res.sendFile(path.join(__dirname, '../view/groupcreate.html'));
        return;
    }

    res.redirect('./login');
    return;
    
}

function groupcontentView(req, res){

    if(req.session.user){
        res.sendFile(path.join(__dirname, '../view/groupcontent.html'));
        return;
    }

    res.redirect('./login');
    return;

}

function groupacceptView(req, res){

    if(!req.session.user) return res.redirect('./login');
    if(!req.query.group_id) return res.redirect('./grouplist');
    const levelPromise = checklevel(req.query.group_id,req.session.user.id);
    levelPromise.then((arg)=>{
        if(arg.status==='fail') return res.redirect('./grouplist');
        return res.sendFile(path.join(__dirname, '../view/groupaccept.html'));
    });

}

exports.grouplistView = grouplistView;
exports.groupcreateView = groupcreateView;
exports.groupcreate = groupcreate;
exports.groupList = groupList;
exports.groupcontentView =  groupcontentView;
exports.groupacceptView =  groupacceptView;
exports.groupContent = groupContent;
exports.checkLevelBtn = checkLevelBtn;
exports.updateToken = updateToken;
exports.acceptAccount = acceptAccount;
exports.acceptHandle = acceptHandle;
exports.deleteUser = deleteUser;

