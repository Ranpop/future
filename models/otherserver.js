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
/* GET home page. */
app.get('/', function(req, res, next) {
		return res.render('index',{
			title: 'Future',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

app.get('/upload', checkLogin);
app.get('/upload', function(req, res){
	res.render('upload',{
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/upload', checkLogin);
app.post('/upload', function(req, res){
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
