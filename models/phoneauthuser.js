var session = require('express-session');
var User = require('../models/dbuser.js');

exports.generateAuthCode = function(phonenum, callback){
	++session.phonenum;
	++session.authcode;
	session.phonenum = phonenum;

	var authCode=''; 
	for(var i=0;i < 6;i++) 
	{ 
		authCode += Math.floor(Math.random()*10); 
	} 
	session.authcode = authCode;
	//console.log('session phonenum: ' + session.phonenum + ' authcode: '+authCode);
	callback(authCode);
};

exports.storePhoneUser = function(phonenum, authCode, callback){
	++session.user;
	if (phonenum != session.phonenum || authCode != session.authcode){
		return callback(err);
	}

	var authUser = new User({
		name: phonenum,
		password: '',
		email: '',
		phonenum: phonenum
	});

	User.getFromPhoneNum(authUser.phonenum, function(err, user){
		if(user){
			//用户存在，进入分享链条处理
			console.log('用户存在，进入分享链条处理')
			session.user = user;
			console.log(session.user);
			return callback(null);
		}

		//如果用户不存在则新增用户
		authUser.save(function(err, user){
			if(err){
				console.log('存入失败');
				return callback(err);
			}
			console.log(user);
			session.user = user;//用户信息存入session
			console.log('存入成功，进入分享链条处理');
			//session.user = user;
		});
	});

	console.log(session);
	callback(null);
};

exports.getSessionUser = function(callback){
	console.log(session);
	callback(session.user);
}
