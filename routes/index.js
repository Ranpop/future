

var crypto = require('crypto');
var fs = require('fs');
var express = require('express');
var User = require('../models/dbuser.js');
var phoneAuth = require('../models/phoneauthuser.js');
var Post = require('../models/post.js');
var Jobs = require('../models/dbjobs.js');
var ShareChain = require('../models/sharechain_debug.js');
var router = express.Router();
var Comment = require('../models/comment.js');
var Share = require('../models/share.js');
var formidable = require('formidable');
var Qrcode = require('qrcode');
var Wechat = require('wechat');
var API = require('wechat-api');
var wehatsigserver = require('../models/wechatsig_server');
var api = new API('wx52c2d4b50da7ed77', '230cd9497f43cbebe9cbdc7031230e90');
var config = {
  token: 'ranpopwechat',
  appid: 'wx52c2d4b50da7ed77',
  encodingAESKey: 'xeeeR6HqdU0rNNbYwzfh9OgPJeRA9Kmv6hEnu5G83sI'
};

//init wechat signature server
wehatsigserver(router);

/* GET home page. */
router.get('/', function(req, res, next) {
	//console.log(req.session);
	Post.getAll(null, function(err, posts){
		if(err){
			posts = [];
		}
		//console.log(posts);
		return res.render('index',{
			title: 'Future',
			user: req.session.user,
			posts: posts,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/l', function(req, res){
		//console.log(req.session.user);
		req.url = '/';
		Post.getLastAll(null, function(err, posts){
			if(err){
				posts = [];
			}
			return res.render('index',{
			title: 'Future',
			user: req.session.user,
			posts: posts,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/contact', function(req, res){
	res.render('contact',{
		title: 'Future',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.get('/linkedin', function(req, res){
	res.render('linkedin',{
		title: 'Future',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()});
});
	//app.get('/blog', checkNotLogin);
router.get('/blog', function(req, res){
	Jobs.getAll(null, function(err, jobs){
		if(err){
			posts = [];
		}
		res.render('blog',{
		    title: 'Future',
			user: req.session.user,
			jobs: jobs,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/blog/archive', function(req, res){
    Post.getArchive(function(err, posts){
    	if(err){
    		req.flash('error', err);
    		return res.redirect('/blog');
    	}
    	res.render('archive', {
    		title: '存档',
    		posts:posts,
    		user: req.session.user,
    		success: req.flash('success').toString(),
    		error: req.flash('error').toString()
    	});
    });
});

router.get('/blog/tags', function(req, res){
    Post.getTags(function(err, posts){
    	if(err){
    		req.flash('error', err);
    		return res.redirect('/blog');
    	}
    	res.render('tags', {
    		title: '标签',
    		posts:posts,
    		user: req.session.user,
    		success: req.flash('success').toString(),
    		error: req.flash('error').toString()
    	});
    });
});

router.get('/blog/tags/:tag', function(req, res){
    Post.getTag(req.params.tag, function(err, posts){
    	if(err){
    		req.flash('error', err);
    		return res.redirect('/blog');
    	}
    	res.render('tag', {
    		title: 'TAG:' + req.params.tag,
    		posts:posts,
    		user: req.session.user,
    		success: req.flash('success').toString(),
    		error: req.flash('error').toString()
    	});
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res){
	res.render('reg', {
		title: '注册',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
	//console.log("open database0");
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res){
	console.log("req is ",req.body);
	//console.log("open database1.0");
	//var	User = require('../models/dbuser.js');
	var name = req.body.name,
		password = req.body.password,
		password_re = req.body['password-repeat'],
		phonenum = req.body.phonenum;
		
	//检验用户两次输入的密码是否一致
	console.log("password:"+password);
	console.log("password_re:"+password_re);
	if(password_re != password){
		req.flash('error', '两次输入的密码不一致！');
		return res.redirect('/reg');//返回注册页
	}
	//生成密码的md5值
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: req.body.name,
		password: password,
		email: req.body.email,
		phonenum: phonenum,
		ishr: req.body.ishr
	});
	//检查用户名是否存在
	User.get(newUser.name, function(err, user){
		if(user){
			req.flash('error', '用户已经存在!');
			return res.redirect('/reg');//返回注册页
		}
		//如果用户不存在则新增用户
		newUser.save(function(err, user){
			if(err){
				req.flash('error', 'err');
				return res.redirect('/reg');  //注册失败返回注册页
			}
			req.session.user = user;//用户信息存入session
			req.flash('success', '注册成功');
			res.redirect('/');//注册成功后返回主页
		});
	});
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res){
	res.render('login', {
		title: '登陆',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res){
	//生成密码md5值
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	//检查用户名是否存在
	User.get(req.body.name, function(err, user){
		if(!user){
			req.flash('error', '用户名不存在');
			return res.redirect('/login');
		}
		//检查密码是否一致
		//console.log("user.password:"+user.password);
		//console.log("input.password:"+password);
		if(user.password != password){
			req.flash('error', '密码错误！');
			return res.redirect('/login');
		}
		//用户名密码都匹配后，将用户信息存入session
		req.session.user = user;
		req.flash('success', '登陆成功');
		res.redirect('/');
	});
});

router.get('/postjob', checkLogin);
router.get('/postjob', function(req, res){
	res.render('postjob', {
		title: '发布新职位',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});
router.post('/postjob', checkLogin);
router.post('/postjob', function(req, res){
	var jobnamesrc = req.body.jobname;
	var jobname = jobnamesrc.replace(/(^\s*)|(\s*$)/g, "");  //去除前后空格
	console.log("[derek debug]-" + jobname + ' ' + req.body.jobsalary + ' ' + req.body.joblocation + ' ' + req.body.jobfuli + ' ' + req.body.jobrequire + ' ' + req.body.jobothers);
	var currentUser = req.session.user;

	console.log("[derek debug]-2-" + ' ' + currentUser.name + ' ' + jobname + ' ' + req.body.jobsalary + ' ' + req.body.joblocation + ' ' + req.body.jobfuli + ' ' + req.body.jobrequire + ' ' + req.body.jobothers);
	var job = new Jobs(
	{
		publisher: currentUser.name,
		jobname: jobname,
		jobsalary: req.body.jobsalary,
		joblocation: req.body.joblocation,
		jobfuli: req.body.jobfuli,
		jobrequire: req.body.jobrequire,
		jobothers: req.body.jobothers
	});
	console.log("[derek debug]-3");
	job.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功！');
		res.redirect('/u/' + currentUser.name);
	});
});



router.get('/post', checkLogin);
router.get('/post', function(req, res){
	res.render('post', {
		title: '发表',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/post', checkLogin);
router.post('/post', function(req, res){

	var titlesrc = req.body.title;
	var title = titlesrc.replace(/(^\s*)|(\s*$)/g, "");  //去除前后空格
	var currentUser = req.session.user,
		tags = [req.body.tag1],
		post = new Post(currentUser.name, title, req.body.brief, tags, req.body.qrcode, req.body.post);
	post.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功！');
		res.redirect('/');
	});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res){
	req.session.user = null;
	req.flash('success', '退出成功！');
	res.redirect('/');
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res){
	res.render('upload',{
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});
	/*
	app.post('/upload', checkLogin);
	app.post('/upload', function(req, res){
		for(var i in req.files){
			if(req.files[i].size == 0){
				//使用同步方式删除一个文件
				fs.unlinkSync(req.files[i].path);
				console.log('successfully removed an empty file');
			}else{
				var target_path = './public/images/' + req.files[i].name;
				//使用同步方式重命名一个文件
				fs.renameSync(req.files[i].path, target_path);
				console.log('successfully renamed a file');
			}
		}
		req.flash('success', '文件上传成功');
		res.redirect('/upload');
	});*/

router.post('/upload', checkLogin);
router.post('/upload', function(req, res){
	var form = new formidable.IncomingForm();
		//form.keepExtensions = true;
	form.uploadDir = './public/images';
	console.log(__dirname);
	console.log(form.uploadDir);
	form.parse(req, function(err, fields, files){
		if (err) {
			req.flash('success', '文件上传shibai');
			return res.redirect('/upload');
		}
		console.log("123");
		var image = files.imgFile;
		var path = image.path;
		path = path.replace('/\\/g', '/');
		var url = '/upload' + path.substr(path.lastIndexOf('/'), path.length);
		console.log("1234");
		var info = {
			"error": 0,
			"url": url
		};
		console.log("1235");
		//res.send(info);
		console.log("1236");
	});
	req.flash('success', '文件上传ook');
	return res.send(info);
});

router.get('/blog/search', function(req, res){
	Post.search(req.query.keyword, function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/blog');
		}
		res.render('search', {
			title: "SEARCH: " + req.query.keyword,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//get the user's space
router.get('/u/:name', function(req, res){
	//检查用户名是否存在
	User.get(req.params.name, function(err, user){
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}

		if(user.ishr == "yes"){
			//查询并返回该用户所有文章
			Jobs.getAll(user.name, function(err, jobs){
				if(err){
					req.flash('error', err);
					return res.redirect('/');
				}
				
				res.render("hruser", {
					title: user.name,
					jobs: jobs,
					user: req.session.user,
					success: req.flash('success').toString(),
					error:req.flash('error').toString()
				});
			});
		}
		else{
				res.render("intuser", {
					title: user.name,
					user: req.session.user,
					success: req.flash('success').toString(),
					error:req.flash('error').toString()
				});
		}
	});
});

router.get('/getonejob/:publisher/:jobname', function(req, res){
	Jobs.getOne(req.params.publisher, req.params.jobname, function(err, job){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		console.log('pv test ok 1');
		res.render('jobpage', {
			title: req.params.jobname,
			job: job,
			user: req.session.user,
			success: req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
});

router.get('/u/:name/:day/:title', function(req, res){
	Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		console.log('pv test ok 1');
		res.render('article', {
			title: req.params.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
});

router.post('/u/:name/:day/:title', function(req, res){
	var date = new Date(),
		time = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+
		(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
	var comment = {
		name: req.body.name,
		email: req.body.email,
		website: req.body.website,
		time: time,
		content: req.body.content
	};
	var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
	newComment.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', "OK");
		res.redirect('back');
	});
});

router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function(req, res){
	var currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		res.render('edit', {
			title: '编辑',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function(req, res){
	var newurl = req.url.replace('edit', 'u');
	var currentUser = req.session.user;
	Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function(err){
		var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
		if(err){
			req.flash('error', err);
			return res.redirect(url);
		}
		req.flash('success', '修改成功');
		res.redirect(newurl);
	});
});

router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function(req, res){
	var currentUser = req.session.user;
	if (currentUser.name == 'ranpop') {
		Post.remove(req.params.name, req.params.day, req.params.title, function(err){
			if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功');
		res.redirect('/blog');
		})
	}else {
		Post.remove(currentUser.name, req.params.day, req.params.title, function(err){
			if(err){
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功');
			res.redirect('/');
		});
	}
});

router.get('/qrcode', function(req, res){
	console.log(req.url);
	//console.log(req.method);
	Qrcode.toDataURL('https://www.baidu.com/',function(err,url){
		console.log(url);
		res.render('qrcode',{
			user: req.session.user,
			url: url,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//res.send('success');
});

router.post('/wechat', Wechat(config, function (req, res, next) {
	// 微信输入信息都在req.weixin上
	var message = req.weixin;
	console.log(message);

	if((message.MsgType == 'event') && (message.Event == 'subscribe')){
		var reqarticle = '<a href=\"http://www.smartcreate.net/blog\">1. 看看文章休息下</a>';
		var reqregist = '<a href=\"http://www.smartcreate.net/reg\">2. 注册一下</a>';
		var reqlogin = '<a href=\"http://www.smartcreate.net/login\">3. 登录一下</a>';
		var reqempty = '        ';
		var reqstr = '感谢您的关注！' + '\n' + reqempty + '\n' + reqarticle + '\n' + reqempty + '\n' +
			reqregist + '\n' + reqempty + '\n' + reqlogin + '\n' + reqempty + '\n';

		res.reply(reqstr);
	}

	switch (message.MsgType){
		case 'image':
			res.reply([
			{
				title: '图片消息',
        		description: '你发送了一张图片哦',
        		picurl: message.PicUrl,
        		url: message.PicUrl
      		}
      		]);
		break;

		case 'text':
		res.reply({
			content: '你发送了一条文本: '+ '\n' + message.Content,
			type: 'text'
		});
		break;

		case 'voice':
		res.reply({
			title: "来段音乐吧",
        	description: "see u again",
        	musicUrl: "http://play.baidu.com/?__m=mboxCtrl.playSong&__a=99751993&__o=/top/huayu||songListIcon&fr=-1||www.baidu.com#",
        	hqMusicUrl: "http://play.baidu.com/?__m=mboxCtrl.playSong&__a=99751993&__o=/top/huayu||songListIcon&fr=-1||www.baidu.com#",
        	thumbMediaId: message.MediaId
		});
		break;

		default:
		break;
	}
}));

	//shareset handler the first sharing point
router.get('/share/:publisher/:jobname/:sharerid/:sid', checkLogin);
router.get('/share/:publisher/:jobname/:sharerid/:sid', function(req, res){

	var shareentity = {
		job:{
			publisher: req.params.publisher,
			jobname: req.params.jobname
		},
		pair:{
			father: null,
			son: req.params.sharerid	
		}
	};
	var newShare = new ShareChain(shareentity);

	ShareChain.getShare(newShare.publisher, newShare.jobname, req.params.sharerid,function(err, sharechain){
		if(sharechain){
			console.log('[error]sharechain have stroe');
			//ShareChain.calcShareChain(sharechain, req.session.user, function(sharechain){
				// the sharer has shared this job info,give a false response
				res.redirect('https://www.baidu.com/search/error.html');
				return;
		}
		else{
				var share = new Share();
				share.setShare(req.url, req.params.sid,function(err,sharedurlqrcode){
					if(err){
						console.log('share fail...');
						res.redirect('https://www.baidu.com/search/error.html');
						return;
					}
					console.log('share success...');
					res.render('sharescan',{
					title: "请扫描二维码分享",
					qrcode: sharedurlqrcode,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
					});	
					console.log('share success...11');
				});

				newShare.save(function(err, user){
					if(err){
						console.log('store is not ok');
					}
					console.log('store is ok');
				});
		}
	});
});	

router.get('/sendresumesimple/:publisher/:jobname/:sharerid/:userid', function(req, res){
		//register with user's phone number
		res.render('sendresumesimple', {
			title: 'sendresumesimple',
			user: req.params.userid,
			paramspublisher: req.params.publisher,
			paramsjobname: req.params.jobname,
			paramssharedid: req.params.sharerid,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

router.post('/sendresumesimple/:name/:time/:title/:sharerid/:userid', function(req, res){
	console.log("save new resume");
	console.log(req);
	//todo
		res.render('success',{
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
		});	
});

router.get('/notreg/share/:name/:time/:title/:sharerid', function(req, res){
	if (!req.session.user){
		//register with user's phone number
		res.render('wexplatformregister', {
			title: '注册',
			user: req.session.user,
			authcode: "",
			paramsname: req.params.name,
			paramstime: req.params.time,
			paramstitle: req.params.title,
			paramssharedid: req.params.sharerid,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	}});

//shareget handler
router.get('/share/:publisher/:jobname/:sharerid', function(req, res){
	console.log(req.params);
	console.log(req.url);
	console.log('share wwwwww');
	if (req.query.num){
		User.getFromPhoneNum(req.query.num, function(err, user)		{
			if(!user){
				console.log('can not find a user somewhere is wrong');
				res.redirect('https://www.baidu.com/search/error.html');
				return;
			}

			req.session.user = user;
			console.log('get the user like this');
			console.log(req.url.substr(0, req.url.indexOf('?')));
			res.redirect(req.url.substr(0, req.url.indexOf('?')));
		});
	}
	console.log('share ffffff');

	var newShare = new ShareChain(req.params.publisher,req.params.jobname);
	ShareChain.getShare(newShare.name, newShare.title, function(err, sharechain){
		if(sharechain){
			console.log('sharechain have stroe');
			ShareChain.calcShareChain(sharechain, '2', req.session.user, function(sharechain){

			});
		}
		else{
			newShare.save(function(err, user){
				if(err){
					console.log('store is not ok');
				}
				console.log('store is ok');
			});
		}
	});

	var share = new Share();
	share.getShare(req.params.publisher, req.params.jobname, req.params.sharerid,function(err,job,sharer){
		if(err){
			console.log('share fail...');
			//res.redirect('https://www.baidu.com/search/error.html');
			return;
		}
		console.log('share bbbbb');
		//get ok
		res.render('sharedjob',{
			title: req.params.jobname,
			user: req.session.user,
			sharer: sharer,
			job: job,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});	
	});

});	

//sendresume handler
router.get('/sendresumereq/:name/:time/:title/:sharerid', function(req, res){
	//console.log('sharegetreq derek mark index js');
	//console.log(req.url);

		Post.getOne(req.params.name, req.params.time, req.params.title, function(err, post){
			if(err){
				console.log('share fail...');
				res.redirect('https://www.baidu.com/search/error.html');
				return;
			}

			res.render('sendresume',{
				sharer: req.params.sharerid,
				post: post,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});	
		});
});	

//test wxapi
router.get('/sendphtoresume/:publisher/:jobname/:sharerid/:userid', function(req, res){
			res.render('sendphtoresume',{
				title: req.params.jobname,
				publisher: req.params.publisher,
				sharerid: req.params.sharerid,
				userid: req.params.userid,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});	
});	

function checkLogin(req, res, next){
	if(!req.session.user){
		req.flash('error', '未登录！');
		res.redirect('/login');
	}
	next();
}
function checkNotLogin(req, res, next){
	if(req.session.user){
		req.flash('error', '已登录！');
		res.redirect('back');
	}
	next();
}

module.exports = router;
