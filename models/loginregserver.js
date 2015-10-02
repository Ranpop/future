var User = require('../models/dbuser.js');
var crypto = require('crypto');
//about register and login --begin
module.exports = function(app){
app.get('/reg', checkNotLogin);
app.get('/reg', function(req, res){
	res.render('reg', {
		title: '注册',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
	//console.log("open database0");
});

app.post('/reg', checkNotLogin);
app.post('/reg', function(req, res){
	//console.log("req is ",req.body);
	//console.log("open database1.0");
	var name = req.body.name,
		password = req.body.password,
		password_re = req.body['password-repeat'],
		phonenum = req.body.phonenum;
		
	//检验用户两次输入的密码是否一致
	//console.log("password:"+password);
	//console.log("password_re:"+password_re);
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

app.get('/login', checkNotLogin);
app.get('/login', function(req, res){
	res.render('login', {
		title: '登陆',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/login', checkNotLogin);
app.post('/login', function(req, res){
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

app.get('/logout', checkLogin);
app.get('/logout', function(req, res){
	req.session.user = null;
	req.flash('success', '退出成功！');
	res.redirect('/');
});
//about register and login --end
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