/**
 * Created by arrdu on 2015/8/10.
 */
var phoneAuth = require('../models/phoneauthuser.js');
var sessionParmTmp = require('../models/sessionSocketTmp.js');
var getAppsInfo = require('./apps-info'); // 从外部加载app的配置信息
var appIds = getAppsInfo();
var io = require('socket.io')();
var SessionSockets = require('session.socket.io');
var ShareChain = require('./sharechain_debug');
var Job = require('./dbjobs');
var sessionParse,
    sessionStore,
    sessionKey;

sessionParmTmp.getSessionParms(function(parse, store, key){
    sessionParse = parse;
    sessionStore = store;
    sessionKey = key;
});

var sessionSockets = new SessionSockets(io, sessionStore, sessionParse, sessionKey);

sessionSockets.on('connection', function (err, socket, session) {
    console.log(socket.id + ': connection');
    //console.log(session);

    socket.on('disconnect', function () {
        console.log(socket.id + ': disconnect');
    });

    socket.on('getauthcode_req', function (phoneno) {
        console.log(socket.id + ': phoneno :' + phoneno);
        ++session.phonenum;
        session.phonenum = phoneno;
        phoneAuth.generateAuthCode(function(authCode){
            ++session.authcode;
            session.authcode = authCode;
            socket.emit('getauthcode_resp', authCode);
        });
    });

    socket.on('confirmauthcode_req', function (phonenum, authcode) {
        console.log(socket.id + ' confirmauthcode: ' + authcode + ' phonenum: ' + phonenum);
        phoneAuth.storePhoneUser(phonenum, authcode, session.authcode, session.phonenum, function(err, user){
            if (err){
                //socket.emit('confirmauthcode_resp','RET_CONFIRMAUTHCODE_FAILED');
            }
            else{
                sessionSockets.getSession(socket, function (err, session) {
                    if (err)
                        console.log('get error');
                    console.log('get right');
                    session.user = user;
                    console.log(session);
                });
                socket.emit('confirmauthcode_resp','RET_CONFIRMAUTHCODE_SUC');
            }
        });
    });

    socket.on('addnewshare_req', function (newshare) {
        console.log('addnewshare_req-newsharerid:' + newshare.newsharerid + '-presharerid:' + 
            newshare.presharerid + '-postname:' + newshare.post.publisher + '-jobname:' + newshare.post.jobname);

            var shareentity = {
                job:{
                    publisher: newshare.post.publisher,
                    jobname: newshare.post.jobname
                },
                pair:{
                    father: newshare.presharerid,
                    son: newshare.newsharerid    
                }
            };
            var newShare = new ShareChain(shareentity);

            ShareChain.getShare(newShare.publisher, newShare.jobname, newshare.newsharerid,function(err, sharechain){
                if(sharechain){
                    console.log('[error]sharechain have stroe');
                        socket.emit('addnewshare_resp','RET_ADDNEWSHARE_ERR_ALREADYHAVE');
                        return;
                }
                else{
                        newShare.save(function(err, user){
                            if(err){
                                console.log('store is not ok');
                                socket.emit('addnewshare_resp','RET_ADDNEWSHARE_ERR_STOREFAIL');
                                return;
                            }
                            console.log('store is ok');
                            //increase the sharetimes of this job
                            Job.increaseShareTimes(newShare.publisher, newShare.jobname, function(err){
                                if(err){
                                    console.log('increase sharetimes fail');
                                    socket.emit('addnewshare_resp','RET_ADDNEWSHARE_ERR_INCREASESHARETIMEFAIL');
                                    return;
                                }
                                console.log('increase sharetimes ok');
                            });
                            socket.emit('addnewshare_resp','RET_ADDNEWSHARE_ERR_SUCC');
                            return;
                        });
                }
            });


        
    });

    socket.on('upload_req', function (servierid) {
        console.log('servierid:' + servierid);
        https.get('http://file.api.weixin.qq.com/cgi-bin/media/get?access_token='+ appIds[0].accesstoken +'&media_id=' + servierid, function(_res){
            console.log('upload_req-image:' + _res);
        });
        socket.emit('upload_resp','RET_UPLOADPIC_SUC');
    });
});

exports.listen = function (server) {
    return io.listen(server);
}; 