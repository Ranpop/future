
var mongodb = require('./db');

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
	this.phonenum = user.phonenum;
	this.ishr = user.ishr;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback){
	//要存入数据库的用户文档
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		phonenum: this.phonenum,
		ishr: this.ishr
	};
	//打开数据库
	mongodb.open(function(err, db){
		if (err) {
			return callback(err); //错误，返回err信息
		}
		//读取user集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err); //错误
			}
			//将用户数据插入users集合
			collection.insert(user, {safe:true}, function(err, user){
				mongodb.close();
				if(err){
					return callback(err); //错误，返回
				}
				callback(null, user.ops[0]); //成功，err为null，返回用户存储后的用户文档
			});
		});
	});
};

//读取用户信息
User.get = function(name, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err); //错误
		}
		//读取users集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err); //错误
			}
			//查找用户信息(name键值)为name的一个文档
			collection.findOne({name: name}, function(err, user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, user);//成功，返回查询用户信息
			});
		});
	});
};

//读取用户信息
User.getbyPhoneNum = function(phonenum, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err); //错误
		}
		//读取users集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err); //错误
			}
			//查找用户信息(name键值)为name的一个文档
			collection.findOne({phonenum: phonenum}, function(err, user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, user);//成功，返回查询用户信息
			});
		});
	});
};



