const chai = require('chai');
const chaiHttp = require('chai-http');
const apiKeyValidator = require('../utils/api-key-validator');
const bodyParser = require("body-parser");

chai.use(chaiHttp);

describe('utils#api-key-validator', function () {
    let app;

    before(function () {
        app = require('express')();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded());
        app.post('*', apiKeyValidator.syncValidator({apiKey: 'testApiKey'}));
    });

    it('正確apikey', function () {
        chai.request(app)
            .post('/')
            .send({apiKey: 'testApiKey'})
            .end((err, res) =>{

            });
    });
});
