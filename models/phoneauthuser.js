
var User = require('../models/dbuser.js');

exports.generateAuthCode = function(callback){
	var authCode=''; 
	for(var i=0;i < 6;i++) 
	{ 
		authCode += Math.floor(Math.random()*10); 
	} 
	callback(authCode);
};

exports.storePhoneUser = function(phonenum, authCode, sessionAu, sessionPh, callback){

	if (phonenum != sessionPh || authCode != sessionAu){
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
			//session.user = user;
			//console.log(user);
			return callback(null, user);
		}

		//如果用户不存在则新增用户
		authUser.save(function(err, user){
			if(err){
				console.log('存入失败');
				return callback(err);
			}
			//console.log(user);
			//session.user = user;//用户信息存入session
			console.log('存入成功，进入分享链条处理');
			return callback(null, user);
		});
	});

	//console.log(session);
	//callback(null);
};

