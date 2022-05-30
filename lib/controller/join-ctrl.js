
const db = require('../my-db');
const path = require('path');
const GroupList = require('../model/GroupList');
const GroupPermitList = require('../model/GroupPermitList');
const groupListModel = new GroupList();
const groupPermitListModel = new GroupPermitList();
//申請加入
async function join(req, res) {

    if(!req.session.user) return res.json({status:'fail',msg:'未登入'});
    

    if(req.body.token === '' || typeof req.body.token==='undefined'){
        return res.json({status:'fail',msg:'請輸入token'});
    }

    const [success,results,fields] = await groupListModel.selectGroupList('Select',{token:req.body.token});

    if(!success) return res.json({status:'fail',msg:'token輸入錯誤'});
    if( results[0].uid === req.session.user.id ) return res.json({status:'fail',msg:'無法加入自己的群組'});

    const [success2,results2,fields2] = await groupPermitListModel.selectGroupPermitList('Select',{group_id:results[0].id,uid:req.session.user.id});

    if( success2 ) return res.json({status:'fail',msg:'已申請過'});

    let PermitListData ={
        uid:req.session.user.id,
        group_id:results[0].id,
        is_accept:0,
    }

    const [success3,results3,fields3] = await groupPermitListModel.createGroupPermitList(PermitListData);
    if(success3) return res.json({status:'ok',msg:'申請成功'});
    return;
}

//加入列表
async function joinlist(req, res) {

    if(!req.session.user)return res.json({status:'fail',msg:'未登入'});
    const [success,results,fields] = await groupPermitListModel.selectGroupPermitList('JoinGroupList',{uid:req.session.user.id});
    return res.json({status:'ok',msg:results});
   
}


function joinView(req, res){

    if(req.session.user){
        res.sendFile(path.join(__dirname, '../view/joinlist.html'));
        return;
    }else{
        res.redirect('./login');
        return;
    }
}

function joinContentView(req,res){

    if(req.session.user){
        res.sendFile(path.join(__dirname, '../view/joinContent.html'));
        return;
    }else{
        res.redirect('./login');
        return;
    }
}

exports.join = join;
exports.joinView = joinView;
exports.joinContentView = joinContentView;
exports.joinlist = joinlist;