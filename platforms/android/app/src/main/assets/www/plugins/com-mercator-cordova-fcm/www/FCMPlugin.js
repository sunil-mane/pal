cordova.define("com-mercator-cordova-fcm.FCMPlugin", function(require, exports, module) {
var exec = require('cordova/exec');

function FCMPlugin() { 
	console.log("FCMPlugin.js: is created");
}





// GET TOKEN //
FCMPlugin.prototype.getToken = function( success, error ){
	exec(success, error, "FCMPlugin", 'getToken', []);
}
// SUBSCRIBE TO TOPIC //
FCMPlugin.prototype.subscribeToTopic = function( topic, success, error ){
	exec(success, error, "FCMPlugin", 'subscribeToTopic', [topic]);
}
// UNSUBSCRIBE FROM TOPIC //
FCMPlugin.prototype.unsubscribeFromTopic = function( topic, success, error ){
	exec(success, error, "FCMPlugin", 'unsubscribeFromTopic', [topic]);
}
// NOTIFICATION CALLBACK //
FCMPlugin.prototype.onNotification = function( callback, success, error ){
	FCMPlugin.prototype.onNotificationReceived = callback;
	exec(success, error, "FCMPlugin", 'registerNotification',[]);
}
// DEFAULT NOTIFICATION CALLBACK //
FCMPlugin.prototype.onNotificationReceived = function(payload){
	console.log("Received push notification")
	console.log(payload)
}

//Check Permission for notification
FCMPlugin.prototype.hasPermission = function(successCallback, errorCallback) {
	if (!errorCallback) { errorCallback = function() {}; }
	exec(successCallback, errorCallback, 'FCMPlugin', 'hasPermission', []);
};

//Open App notification settings
FCMPlugin.prototype.openSettings = function(successCallback, errorCallback) {
	if (!errorCallback) { errorCallback = function() {}; }
	exec(successCallback, errorCallback, 'FCMPlugin', 'openSettings', []);
};

// FIRE READY //
exec(function(result){ console.log("FCMPlugin Ready OK") }, function(result){ console.log("FCMPlugin Ready ERROR") }, "FCMPlugin",'ready',[]);





var fcmPlugin = new FCMPlugin();
module.exports = fcmPlugin;

});
