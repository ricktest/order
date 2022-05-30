
const db = require('../my-db');
const path = require('path');
const { clog } = require('sakawa-core/hdl-logger');
function register(req, res) {

    const verifyData = checkRegisterForm(req.body);
    
    if( verifyData.status ==='ok' ){
        const userInfoPromise = selectUserSingle(req.body.account);
        
        userInfoPromise.then(([success, results, fields])=>{
            clog(success);
            if(success){
                res.json({status:'fail',msg:'帳號已重複'});
            }else{

                let userData ={
                    name:req.body.name,
                    uid:req.body.account,
                    password:req.body.password,
                    point:0
                }

                createUser(userData).then(([success, results, fields])=>{
                    if(success){
                        res.json({status:'ok',msg:'註冊成功'});
                    }
                });
            }

        })
        return;
    }else{
        res.json({status:verifyData.status,msg:verifyData.msg});
        return ;
    }
}

function selectUserSingle(account){

    let sql_query_set = db.sql_query_set('account_list');
    sql_query_set.where = `\`uid\` = ${db.escape(account)}`;
    return db.n_sql_select(sql_query_set);
}

function createUser(userData) {
    return db.n_sql_insert('account_list', userData);
}

function login(req, res) {

    const verifyData = checkLoginForm(req.body);

    if( verifyData.status ==='ok' ){

        const verifyPromist = verifyLogin(req.body);
        
        verifyPromist.then(([success, results, fields])=>{
            console.log(success);
            if (success) {
                req.session.user = results[0];
                return res.json({status:'ok',msg:'登入成功'}); 
            } else {
                return res.json({status:'fail',msg:'帳號密碼錯誤'}); 
            }

        }).catch((error) => {
            console.log(error);
            //return res.json({status:'fail',msg:error}); 
        });
    }else{
        return res.json({status:verifyData.status,msg:verifyData.msg});
    }
}

function verifyLogin(logindata){

    
    let sql_query_set = db.sql_query_set('account_list');
    sql_query_set.where = ` \`uid\` = ${db.escape(logindata.account)} AND \`password\` = ${db.escape(logindata.password)} `;
    
    return db.n_sql_select(sql_query_set);

}

function checkRegisterForm(registerData){

    if(typeof registerData.account === 'undefined' || typeof registerData.password === 'undefined' || typeof registerData.name === 'undefined' ){
        return {status:'fail',msg:'account,name,password 欄位必填'};
    }

    if(registerData.name.length > 10){
        return {status:'fail',msg:'名字不得超過10個字元'};
    }

    if(registerData.account.length > 10){
        return {status:'fail',msg:'帳號不得超過10個字元'};
    }

    if(registerData.password.length > 20){
        return {status:'fail',msg:'密碼不得超過20個字元'};
    }

    if( registerData.account === '' || registerData.password === '' || registerData.name ==='' ){
        return {status:'fail',msg:'請輸入帳號、密碼、名字'};
    }

    return {status:'ok'};
}

function checkLoginForm(logindata){
    
    if(typeof logindata.account === 'undefined' ){
        return {status:'fail',msg:'account 欄位必填'};
    }

    if(typeof logindata.password === 'undefined' ){
        return {status:'fail',msg:'password 欄位必填'};
    }

    if( logindata.account === '' || logindata.password === ''){
        return {status:'fail',msg:'請輸入帳號、密碼'};
    }

    return {status:'ok'};
}

function loginView(req, res) {
    res.sendFile(path.join(__dirname, '../view/login.html'));
}

function registerView(req, res) {
    
    res.sendFile(path.join(__dirname, '../view/register.html'));
    //res.send('<h1>register</h1>');
}

exports.loginView = loginView;
exports.registerView = registerView;
exports.login = login;
exports.register = register;