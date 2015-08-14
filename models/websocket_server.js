/**
 * Created by arrdu on 2015/8/10.
 */

var io = require('socket.io')();

io.on('connection', function (_socket) {
    console.log(_socket.id + ': connection');
    

    _socket.on('disconnect', function () {
        console.log(_socket.id + ': disconnect');
    });

    _socket.on('getauthcode_req', function (_phoneno) {
        console.log(_socket.id + ': _phoneno :' + _phoneno);
        //todo generate the authcode

        _socket.emit('getauthcode_resp',_phoneno);
    });

    _socket.on('confirmauthcode_req', function (_authcode) {
        console.log(_socket.id + ': confirmauthcode :' + _authcode);
        _socket.emit('confirmauthcode_resp','RET_CONFIRMAUTHCODE_SUC');
    });

    _socket.on('addnewshare_req', function (_newshare) {
        console.log('addnewshare_req-newsharerid:' + _newshare.newsharerid + '-presharerid:' + _newshare.presharerid + '-postname:' + _newshare.post.name);
        _socket.emit('addnewshare_resp','RET_ADDNEWSHARE_SUC');
    });
});

exports.listen = function (_server) {
    return io.listen(_server);
};