/**
 * Created by coofly on 2014/7/12.
 */

var chat_server = 'http://' + location.hostname + ':3000';
console.log('server: ' + chat_server);
var socket = io.connect(chat_server);
var count = 0;
socket.on('upload_resp', function (respcode) {
	count--;
	if(count == 0){
		$('#launchmodalbtn').click();
	}
});

function informServerToRecv(serverid){
	socket.emit('upload_req', serverid);
}