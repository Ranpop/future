/**
 * Created by arrdu on 2015/8/10.
 */
var getAppsInfo = require('./apps-info'); // 从外部加载app的配置信息
var appIds = getAppsInfo();
var io = require('socket.io')();

io.on('connection', function (socket) {
    console.log(socket.id + ': connection');
    

    socket.on('disconnect', function () {
        console.log(socket.id + ': disconnect');
    });

    socket.on('getauthcode_req', function (phoneno) {
        console.log(socket.id + ': phoneno :' + phoneno);
        //todo generate the authcode

        socket.emit('getauthcode_resp', phoneno);
    });

    socket.on('confirmauthcode_req', function (authcode) {
        console.log(socket.id + ': confirmauthcode :' + authcode);
        socket.emit('confirmauthcode_resp','RET_CONFIRMAUTHCODE_SUC');
    });

    socket.on('addnewshare_req', function (newshare) {
        console.log('addnewshare_req-newsharerid:' + newshare.newsharerid + '-presharerid:' + 
            newshare.presharerid + '-postname:' + newshare.post.name);
        socket.emit('addnewshare_resp','RET_ADDNEWSHARE_SUC');
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