/**
 * Created by coofly on 2014/7/12.
 */

var chat_server = 'http://' + location.hostname + ':3000';
console.log('server: ' + chat_server);
var socket = io.connect(chat_server);

var shareorsend = 'share';
var user_phoneno = 0;
socket.on('getauthcode_resp', function (_authcode) {
	console.log('respauthcode: ' + _authcode);
	$("#authcodedis").html(_authcode); 
});

socket.on('confirmauthcode_resp', function (_respcode) {
	console.log('respconfirmed: ' + shareorsend);
	if(shareorsend == 'share'){
		$("#authcodedis").html("confirm ok!!! share"); 
		closeModal();
		shareIndAppear();
	}
	else if(shareorsend == 'send'){
		$("#authcodedis").html("confirm ok!!! send"); 
		getsendresumesimply();
	}
	else{
		$("#authcodedis").html(_respcode); 
	}
});

socket.on('addnewshare_resp', function (_authcode) {
	console.log('respauthcode: ' + _authcode);
	$("#authcodedis").html(_authcode); 
});

function getauthcodejs() {
	user_phoneno = document.getElementById("phonenumber").value;
    socket.emit('getauthcode_req', document.getElementById("phonenumber").value);
}

function confirmauthcodejs() {
    socket.emit('confirmauthcode_req', document.getElementById("phonenumber").value,
    	document.getElementById("confirmno").value);
}

function addnewsharerjs(newsharer,presharer,postname,posttime,posttitle) {
	console.log('informthenewsharer: ' + newsharer + ':' + presharer);
    socket.emit('addnewshare_req',  {'newsharerid':newsharer,
    								'presharerid':presharer,
    								'post':{'name':postname,
    										'time':posttime,
    										'title':posttitle}});
}

