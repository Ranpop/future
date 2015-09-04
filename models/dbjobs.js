var mongodb = require('./db');

function Jobs(job){
	console.log("[derek debug]-Job " + job.jobname);
	this.publisher = job.publisher;
	this.jobname = job.jobname;
	this.jobsalary = job.jobsalary;
	this.joblocation = job.joblocation;
	this.jobfuli = job.jobfuli;
	this.jobrequire = job.jobrequire;
	this.jobothers = job.jobothers;
};

module.exports = Jobs;

//存储用户信息
Jobs.prototype.save = function(callback){
	console.log("[derek debug]-Jobsave");
	var date = new Date();
	console.log("[derek debug]-Jobsave 2");
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + (date.getDate()),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() +
		":" + (date.getMinutes() < 10 ? '0' + date.getMinutes():date.getMinutes())
	};
console.log("[derek debug]-Jobsave 3");
	//要存入数据库的用户文档
	var job = {
		publisher: this.publisher,
		time: time,
		jobname: this.jobname,
		jobsalary: this.jobsalary,
		joblocation: this.joblocation,
		jobfuli: this.jobfuli,
		jobrequire: this.jobrequire,
		jobothers: this.jobothers
	};
	console.log("[derek debug]-Job 4");
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取JOBS集合
		db.collection('jobs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//将文档插入post集合
			collection.insert(job, {
				safe: true
			}, function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//读取JOB信息
Jobs.get = function(jobname, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err); //错误
		}
		//读取jobs集合
		db.collection('jobs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err); //错误
			}
			//查找job信息(jobname键值)为jobname的一个文档
			collection.findOne({jobname: jobname}, function(err, job){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, job);//成功，返回查询JOB信息
			});
		});
	});
};

//读取文章以及相关信息
Jobs.getAll = function(name, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('jobs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.publisher = name;
			}
			//根据query对象查询文章
			collection.find(query).sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				//解析markdown为html
				//docs.forEach(function(doc){
				//	doc.post = markdown.toHTML(doc.post);
				//});
				//console.log(docs);
				callback(null, docs);
			});
		});
	});
};

Jobs.getOne = function(publisher, jobname, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('jobs', function(err, collection){//is post not posts
			if(err){
				console.log('1');
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"publisher": publisher,
				"jobname": jobname
			}, function(err, doc){
				if(err){
					console.log('2');
					mongodb.close();
					return callback(err);
				}
				callback(null, doc);
			});
		});
	});
};