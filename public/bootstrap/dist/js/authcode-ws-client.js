/**
 * Created by coofly on 2014/7/12.
 */

var chat_server = 'http://' + location.hostname + ':8080';
console.log('server: ' + chat_server);
var socket = io.connect(chat_server);

var shareorsend = 'share';
var userid = 0;
socket.on('respauthcode', function (_authcode) {
	console.log('respauthcode: ' + _authcode);
	$("#authcodedis").html(_authcode); 
});

socket.on('respconfirmed', function (_respcode) {
	if(shareorsend == 'share'){
		$("#authcodedis").html("confirm ok!!! share"); 
		WeiXinShareBtn();
	}
	else if(shareorsend == 'send'){
		$("#authcodedis").html("confirm ok!!! send"); 
		getsendresumesimply();
	}
	else{
		$("#authcodedis").html(_respcode); 
	}
});

function getauthcodejs() {
	userid = document.getElementById("phonenumber").value;
    socket.emit('getauthcode', document.getElementById("phonenumber").value);
}
function confirmauthcodejs() {
    socket.emit('confirmauthcode', document.getElementById("confirmno").value);
}