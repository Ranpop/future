var sessionParse;
var sessionStore;
var sessionKey;

exports.setSessionParms = function(parse, store, key){
	sessionParse = parse;
	sessionStore = store;
	sessionKey = key;
};

exports.getSessionParms = function(callback){
	callback(sessionParse, sessionStore, sessionKey);
};