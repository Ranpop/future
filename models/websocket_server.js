/**
 * Created by arrdu on 2015/8/10.
 */

var io = require('socket.io')();

io.on('connection', function (_socket) {
    console.log(_socket.id + ': connection');
    

    _socket.on('disconnect', function () {
        console.log(_socket.id + ': disconnect');
    });

    _socket.on('getauthcode', function (_phoneno) {
        console.log(_socket.id + ': _phoneno :' + _phoneno);
        _socket.emit('respauthcode',_phoneno);
    });

    _socket.on('confirmauthcode', function (_authcode) {
        console.log(_socket.id + ': confirmauthcode :' + _authcode);
        _socket.emit('respconfirmed','good!you have confirmed!!');
})
});

exports.listen = function (_server) {
    return io.listen(_server);
};