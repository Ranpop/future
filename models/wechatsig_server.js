var http = require("http");
var https = require("https");
var sha1 = require('sha1');
var querystring = require('querystring');
var config = {
  token: 'ranpopwechat',
  appid: 'wx52c2d4b50da7ed77',
  encodingAESKey: 'xeeeR6HqdU0rNNbYwzfh9OgPJeRA9Kmv6hEnu5G83sI'
};
var Wechat = require('wechat');
var API = require('wechat-api');
var api = new API('wx52c2d4b50da7ed77', '230cd9497f43cbebe9cbdc7031230e90');

module.exports = function(app){
	// 输出数字签名对象
	var responseWithJson = function (res, data) {
		// 允许跨域异步获取
		res.set({
			"Access-Control-Allow-Origin": "*"
			,"Access-Control-Allow-Methods": "POST,GET"
			,"Access-Control-Allow-Credentials": "true"
		});
		res.json(data);
	};

	// 随机字符串产生函数
	var createNonceStr = function() {
		return Math.random().toString(36).substr(2, 15);
	};

	// 时间戳产生函数
	var createTimeStamp = function () {
		return parseInt(new Date().getTime() / 1000) + '';
	};

	var errorRender = function (res, info, data) {
		if(data){
			console.log(data);
			console.log('---------');
		}
		res.set({
			"Access-Control-Allow-Origin": "*"
			,"Access-Control-Allow-Methods": "POST,GET"
			,"Access-Control-Allow-Credentials": "true"
		});
		responseWithJson(res, {errmsg: 'error', message: info, data: data});
	};

	// 2小时后过期，需要重新获取数据后计算签名
	var expireTime = 7200 - 100;

	/**
		公司运营的各个公众平台appid及secret
		对象结构如：
		[{
			appid: 'wxa0f06601f19433af'
			,secret: '097fd14bac218d0fb016d02f525d0b1e'
		}]
	*/
	// 路径为'xxx/rsx/0'时表示榕树下
	// 路径为'xxx/rsx/1'时表示榕树下其它产品的公众帐号
	// 以此以0,1,2代表数组中的不同公众帐号
	// 以rsx或其它路径文件夹代表不同公司产品
	var getAppsInfo = require('./apps-info'); // 从外部加载app的配置信息
	var appIds = getAppsInfo();
	/**
		缓存在服务器的每个URL对应的数字签名对象
		{
			'http://game.4gshu.com/': {
				appid: 'wxa0f06601f194xxxx'
				,secret: '097fd14bac218d0fb016d02f525dxxxx'
				,timestamp: '1421135250'
				,noncestr: 'ihj9ezfxf26jq0k'
			}
		}
	*/
	var cachedSignatures = {};

	// 计算签名
	var calcSignature = function (ticket, noncestr, ts, url) {
		var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
		return sha1(str);
	}

	// 获取微信签名所需的ticket
	var getTicket = function (url, index, res, accessData) {
		appIds[index].accesstoken = accessData.access_token;
		https.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ accessData.access_token +'&type=jsapi', function(_res){
			var str = '', resp;
			_res.on('data', function(data){
				str += data;
			});
			_res.on('end', function(){
				console.log('return ticket:  ' + str);
				try{
					resp = JSON.parse(str);
				}catch(e){
			        return errorRender(res, '解析远程JSON数据错误', str);
				}
				
				var appid = appIds[index].appid;
				var ts = createTimeStamp();
				var nonceStr = createNonceStr();
				var ticket = resp.ticket;
				var signature = calcSignature(ticket, nonceStr, ts, url);

				appIds[index].ticket = resp.ticket;

				cachedSignatures[url] = {
					nonceStr: nonceStr
					,appid: appid
					,timestamp: ts
					,signature: signature
					,url: url
				};
				
				responseWithJson(res, {
					nonceStr: nonceStr
					,timestamp: ts
					,appid: appid
					,signature: signature
					,url: url
				});
			});
		});
	};

	// 通过请求中带的index值来判断是公司运营的哪个公众平台
	app.post('/wechatsigserver/:index', function(req, res) {
		var index = req.params.index;
		var _url = req.body.url;
		var signatureObj = cachedSignatures[_url];

		if(!_url){
			return errorRender(res, '缺少url参数');
		}
		
		// 如果缓存中已存在签名，则直接返回签名
		if(signatureObj && signatureObj.timestamp){
			var t = createTimeStamp() - signatureObj.timestamp;
			console.log(signatureObj.url, _url);
			// 未过期，并且访问的是同一个地址
			// 判断地址是因为微信分享出去后会额外添加一些参数，地址就变了不符合签名规则，需重新生成签名
			if(t < expireTime && signatureObj.url == _url){
				console.log('======== result from cache ========');
				return responseWithJson(res, {
					nonceStr: signatureObj.nonceStr
					,timestamp: signatureObj.timestamp
					,appid: signatureObj.appid
					,signature: signatureObj.signature
					,url: signatureObj.url
				});
			}
			// 此处可能需要清理缓存当中已过期的数据
		}

		
		// 获取微信签名所需的access_token
		https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+ appIds[index].appid +'&secret=' + appIds[index].secret, function(_res) {
			var str = '';
			_res.on('data', function(data){
				str += data;
			});
			_res.on('end', function(){
				console.log('return access_token:  ' + str);
				try{
					var resp = JSON.parse(str);
				}catch(e){
			        return errorRender(res, '解析access_token返回的JSON数据错误', str);
				}

				getTicket(_url, index, res, resp);
			});
		})
	 	
	});
//for ranpop's wechat
app.post('/wechat', Wechat(config, function (req, res, next) {
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
};
