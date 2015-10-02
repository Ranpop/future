var fs = require('fs');
var User = require('../models/dbuser.js');
var phoneAuth = require('../models/phoneauthuser.js');
var Post = require('../models/post.js');
var Jobs = require('../models/dbjobs.js');
var ShareChain = require('../models/sharechain_debug.js');
var Comment = require('../models/comment.js');
var Share = require('../models/share.js');
var formidable = require('formidable');
var Qrcode = require('qrcode');
module.exports = function(app){
//get the user's space
app.get('/u/:name', function(req, res){
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

app.get('/sendresumesimple/:publisher/:jobname/:sharerid/:userid', function(req, res){
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

app.post('/sendresumesimple/:name/:time/:title/:sharerid/:userid', function(req, res){
	console.log("save new resume");
	console.log(req);
	//todo
		res.render('success',{
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
		});	
});

app.get('/notreg/share/:name/:time/:title/:sharerid', function(req, res){
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
	}
});

//sendresume handler
app.get('/sendresumereq/:name/:time/:title/:sharerid', function(req, res){
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
app.get('/sendphtoresume/:publisher/:jobname/:sharerid/:userid', function(req, res){
			res.render('sendphtoresume',{
				title: req.params.jobname,
				publisher: req.params.publisher,
				sharerid: req.params.sharerid,
				userid: req.params.userid,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});	
});	

}
