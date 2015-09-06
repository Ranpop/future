var mongodb = require('./db');
var Qrcode = require('qrcode');
//var markdown = require('markdown').markdown;

function Post(name, title, brief, tags, qrcode, post){
	this.name = name;
	this.title = title;
	this.tags = tags;
	this.qrcode = qrcode;
	this.brief = brief;
	this.post = post;
}

module.exports = Post;

//存储一篇文章以及相关内容
Post.prototype.save = function(callback){
	//Qrcode.toDataURL('http://www.smartcreate.net/',function(err,url){
	//	console.log(url);
	//});
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + (date.getDate()),
		minute: date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() +
		":" + (date.getMinutes() < 10 ? '0' + date.getMinutes():date.getMinutes())
	};

	if ('yes' == this.qrcode){
			var urlqrbase = 'http://www.smartcreate.net/u/'
	        var name = this.name;
	        var qrtitle = this.title;
	        var urlqr = urlqrbase.concat(name, '/', time.day, '/', qrtitle);
	        var name = this.name, title = this.title, tags = this.tags, brief = this.brief, post1 = this.post;
			//console.log(urlqr);
			//console.log(post1+'qqqq'+this.post);
			//var urlimage = Qrcode.toDataURL(urlqr, function(err, url){
			//	console.log('success');
			//	return url;
			//});
			//console.log('shit'+ urlimage);
			Qrcode.toDataURL(urlqr, function(err,url){
				//console.log(this.name);
		    	//console.log(url);
				var post = {
					name: name,
					time: time,
					title: title,
					tags: tags,
					qrcode: url,
					brief: brief,
					post: post1,
					comments: [],
					pv: 0
				};
				//打开数据库
				//console.log(post);
				mongodb.open(function(err, db){
				if(err){
					return callback(err);
				}
				//读取post集合
				db.collection('post', function(err, collection){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//将文档插入post集合
				collection.insert(post, {
					safe: true
				}, function(err){
					mongodb.close();
					if(err){
						return callback(err);
					}
					console.log('save success!');
					callback(null);
					});
				});
			});
		});
	}
	else{
	//要存入数据库文档
		var post = {
			name: this.name,
			time: time,
			title: this.title,
			tags: this.tags,
			qrcode: this.qrcode,
			brief: this.brief,
			post: this.post,
			comments: [],
			pv: 0
		};
		//打开数据库
		mongodb.open(function(err, db){
			if(err){
				return callback(err);
			}
			//读取post集合
			db.collection('post', function(err, collection){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//将文档插入post集合
				collection.insert(post, {
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

	}
};

//读取文章以及相关信息
Post.getAll = function(name, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
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

//读取文章以及相关信息
Post.getLastAll = function(name, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			//根据query对象查询文章
			collection.find(query).sort({
				time: 1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				//console.log(docs);
				callback(null, docs);
			});
		});
	});
};

Post.getOne = function(name, day, title, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){//is post not posts
			if(err){
				console.log('1');
				mongodb.close();
				return callback(err);
			}
			//console.log('name:'+ name);
			//console.log("day:"+day);
			//console.log("title:"+ title);
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, doc){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//console.log(doc);
				//doc.post = markdown.toHTML(doc.post);
				if(doc){
					collection.update({
						"name": name,
						"time.day": day,
						"title": title
					}, {
						$inc: {"pv": 1}
					}, function(err){
						mongodb.close();
						if(err){
							return callback(err);
						}
					});
					callback(null, doc);
				}
			});
		});
	});
};

//返回原始发表的内容()
Post.edit = function(name, day, title, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据用户名，发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, doc);
			});
		});
	});
};

//更新一篇文章及相关信息
Post.update = function(name, day, title, post, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$set: {post: post}
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

//删除一篇文章
Post.remove = function(name, day, title, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.remove({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				w: 1
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

//返回所有文章的存档信息
Post.getArchive = function(callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//返回只包含 name/time/title属性的文档组成的存档数组
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

//返回所有标签
Post.getTags = function(callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//distinct用来找出给定键值的所有不同值
			collection.distinct("tags", function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查询所有tags数组内包含tag的文档
			//返回只含有name,time,title组成的数组
			collection.find({
				"tags": tag
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

//返回通过标题关键字查询的所有文章
Post.search = function(keyword, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('post', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var pattern = new RegExp("^." + keyword + ".*$", "i");
			collection.find({
				"title": pattern
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};