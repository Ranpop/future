var mongodb = require('./db');

function ShareChain(name, title){
	this.name = name;
	this.title = title;
}

module.exports = ShareChain;

ShareChain.prototype.save = function(callback){
	var sharechain = {
		name: this.name,
		title: this.title,
		sharepath: [],
		sharecount: 0
	};
	mongodb.open(function(err, db){
		if (err) {
			return callback(err); //错误，返回err信息
		}
		//读取user集合
		db.collection('sharechains', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err); //错误
			}
			//将用户数据插入users集合
			collection.insert(sharechain, {safe:true}, function(err, sharechain){
				mongodb.close();
				if(err){
					return callback(err); //错误，返回
				}
				//console.log(sharechain.ops[0]);
				callback(null, sharechain.ops[0]); //成功，err为null，返回用户存储后的用户文档
			});
		});
	});
};

ShareChain.addShare = function(name, title, sharefather, sharecurrent, callback){
	mongodb.open(function(err, db){
		if (err){
			return callback(err);
		}

		db.collection('sharechains', function(err, collection){
			if (err){
				mongodb.close();
				return callback(err);
			}

			//if (null == sharefather){
			//	var pathkey = "one";
			//	var pathvalue = new 
			//}
			collection.update({
				"name": name,
				"title": title
			}, {
				$push: {"sharepath": {"one":["head"]}}
			}, function(err){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
			
			collection.update({
				"name": name,
				"title": title
			}, {
				$push: {"sharepath": {"two":["two"]}}
			}, function(err){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});

			collection.update({
				"name": name,
				"title": title
			}, {
				$push: {"sharepath.0.one": "three"}
			}, function(err){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

ShareChain.getShare = function(name, title, callback){
	mongodb.open(function(err, db){
		if (err){
			return callback(err);
		}

		db.collection('sharechains', function(err, collection){
			if (err){
				mongodb.close();
				return callback(err);
			}

			collection.findOne({
				"name": name,
				"title": title
			}, function(err, sharechain){
				if(err){
					mongodb.close();
					return callback(err);
				}
				
				console.log(sharechain);
				callback(null, sharechain);
			});
		});
	});
};

ShareChain.calcShareChain = function(sharechain, currentShare, callback){
	if (0 == sharechain.sharecount){
		ShareChain.addShare(sharechain.name, sharechain.title, null, currentShare, function(err){

		});
	}
};



