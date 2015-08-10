/**
 * Created by coofly on 2014/7/12.
 */

var chat_server = 'http://' + location.hostname + ':8080';
console.log('server: ' + chat_server);
var socket = io.connect(chat_server);

socket.on('respauthcode', function (_authcode) {
	console.log('respauthcode: ' + _authcode);
	$("#authcodedis").html(_authcode); 
    document.getElementById("authcodedis").html(_authcode);
});

socket.on('respconfirmed', function () {
	$("#authcodedis").html("confirm ok!!!"); 
    document.getElementById("authcodedis").html("confirm ok!!!");
});

function getauthcodejs() {
    socket.emit('getauthcode', document.getElementById("phonenumber").value);
}
function confirmauthcodejs() {
    socket.emit('confirmauthcode', document.getElementById("confirmno").value);
}