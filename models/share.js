var Jobs = require('../models/dbjobs.js');
var	User = require('../models/dbuser.js');
var Qrcode = require('qrcode');
//var markdown = require('markdown').markdown;
var SHARE_TO_WX = 0;
var SHARE_TO_WB = 1;
function Share(){

}

module.exports = Share;

function ShareToWX(url,callback){
					Qrcode.toDataURL(url, function(err,qrcodeimg){
						callback(err,qrcodeimg);
					});
}
function ShareToWB(url,calback){
					Qrcode.toDataURL(url, function(err,qrcodeimg){
						callback(err,qrcodeimg);
					});
}

function ShareToOtherPlatform(url, sid, callback){
	var sharedurl;
	console.log(url);
	//GenSURL(name,time,title,sharerid,function(url){
	//	sharedurl = url;
	//});
	sharedurl = 'http://www.smartcreate.net:' + global.PORT + url.substring(0, (url.length-2));
    console.log(sharedurl);
	//console.log(sid);
	if(sid == SHARE_TO_WX){
		//console.log('share to wx!');
		ShareToWX(sharedurl,callback);
		return;
	}
	else if(sid == SHARE_TO_WB){
		//console.log('share to wb!');
		ShareToWB(sharedurl,callback);
		return;
	}
	else{
		console.log('can not find the way to share,please check...');
	}
	callback(1,sharedurl);
}


function GetSharedArticle(publisher, jobname, sharerid, callback){
	//get Jobs
	var err;
	Jobs.getOne(publisher,jobname,function(err,doc){
		if(err){
			console.log('get failed')
			return callback(err);
		}
		callback(err,doc,sharerid);
	});

	
}
//share article
Share.prototype.setShare = ShareToOtherPlatform;
//get share article
Share.prototype.getShare = GetSharedArticle;