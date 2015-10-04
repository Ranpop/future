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
app.get('/blog', function(req, res){
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

app.get('/postjob', checkLogin);
app.get('/postjob', function(req, res){
	res.render('postjob', {
		title: '发布新职位',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});
app.post('/postjob', checkLogin);
app.post('/postjob', function(req, res){
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
		jobothers: req.body.jobothers,
		jobjiangjin: req.body.jiangjin
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

app.get('/post', checkLogin);
app.get('/post', function(req, res){
	res.render('post', {
		title: '发表',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/post', checkLogin);
app.post('/post', function(req, res){

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
app.get('/blog/search', function(req, res){
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

app.get('/getonejob/:publisher/:jobname', function(req, res){
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

app.get('/u/:name/:day/:title', function(req, res){
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

app.post('/u/:name/:day/:title', function(req, res){
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

app.get('/edit/:name/:day/:title', checkLogin);
app.get('/edit/:name/:day/:title', function(req, res){
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

app.post('/edit/:name/:day/:title', checkLogin);
app.post('/edit/:name/:day/:title', function(req, res){
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

app.get('/remove/:name/:day/:title', checkLogin);
app.get('/remove/:name/:day/:title', function(req, res){
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

	//shareset handler the first sharing point
app.get('/share/:publisher/:jobname/:sharerid/:sid', checkLogin);
app.get('/share/:publisher/:jobname/:sharerid/:sid', function(req, res){

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
//shareget handler
app.get('/share/:publisher/:jobname/:sharerid', function(req, res){
	console.log(req.params);
	console.log(req.url);
	console.log('share wwwwww');
	if (req.query.num){
		User.getbyPhoneNum(req.query.num, function(err, user)		{
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
		return;
	}
	next();
}
};
