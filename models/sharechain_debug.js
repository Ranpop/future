var mongodb = require('./db');

function ShareChain(shareentity){
	this.publisher = shareentity.job.publisher,
	this.jobname		= shareentity.job.jobname,
	this.father    = shareentity.pair.father,
	this.son       = shareentity.pair.son
}

module.exports = ShareChain;

ShareChain.prototype.save = function(callback){
	var shareentity = {
		publisher:this.publisher,
		jobname:this.jobname,
		father:this.father,
		son:this.son
	};

	mongodb.open(function(err, db){
		if (err) {
			return callback(err); //错误，返回err信息
		}
		//读取user集合
		db.collection('sharechains_debug', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err); //错误
			}
			//将用户数据插入users集合
			collection.insert(shareentity, {safe:true}, function(err, sharechain){
				mongodb.close();
				if(err){
					return callback(err); //错误，返回
				}
				//console.log(sharechain.ops[0]);
				callback(null, null); //成功，err为null，返回用户存储后的用户文档
			});
		});
	});
};

ShareChain.getShare = function(publisher,jobname,son,callback){
	mongodb.open(function(err, db){
		if (err){
			return callback(err);
		}

		db.collection('sharechains_debug', function(err, collection){
			if (err){
				mongodb.close();
				return callback(err);
			}

			collection.findOne({
				"publisher": publisher,
				"jobname": jobname,
				"son": son
			}, function(err, sharechain){
				mongodb.close();
				if(err){
					return callback(err);
				}
				
				console.log(sharechain);
				callback(null, sharechain);
			});
		});
	});
};