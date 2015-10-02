var express = require('express');
var router = express.Router();
var wehatsigserver = require('../models/wechatsig_server');
var loginregserver = require('../models/loginregserver');
var jobserver = require('../models/jobserver');
var userserver = require('../models/userserver');
var otherserver = require('../models/otherserver');

//init wechat signature server
wehatsigserver(router);

//init login reg server
loginregserver(router);

//init job server
jobserver(router);

//init user server
userserver(router);

//init other server
otherserver(router);

module.exports = router;
