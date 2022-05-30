const { Router } = require('express');
const myController = require('./controller/my-ctrl')
const accountController = require('./controller/account-ctrl')
const groupController = require('./controller/group-ctrl')
const joinController = require('./controller/join-ctrl')

const appRouter = Router();
appRouter.post('/register', accountController.register);
appRouter.post('/login', accountController.login);
appRouter.post('/groupcreate', groupController.groupcreate);
appRouter.post('/groupList', groupController.groupList);
appRouter.post('/groupContent', groupController.groupContent);
appRouter.post('/checkLevelBtn', groupController.checkLevelBtn);
appRouter.post('/updateToken', groupController.updateToken);
appRouter.post('/acceptAccount', groupController.acceptAccount);
appRouter.post('/acceptHandle', groupController.acceptHandle);
appRouter.post('/deleteUser', groupController.deleteUser);

appRouter.post('/join', joinController.join);
appRouter.post('/joinlist', joinController.joinlist);


appRouter.get('/', myController.welcome);
appRouter.get('/login', accountController.loginView);
appRouter.get('/register', accountController.registerView);
appRouter.get('/grouplist', groupController.grouplistView);
appRouter.get('/groupcreate', groupController.groupcreateView);
appRouter.get('/groupcontent', groupController.groupcontentView);
appRouter.get('/groupaccept', groupController.groupacceptView);

appRouter.get('/joinlist', joinController.joinView);
appRouter.get('/joincontent', joinController.joinContentView);
exports.router = appRouter;
