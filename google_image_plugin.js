var util = require('util');
var winston = require('winston');


function GoogleImagePlugin () {
	this.request = require('request');
}

// Return true if a message was sent
GoogleImagePlugin.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
GoogleImagePlugin.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}

GoogleImagePlugin.prototype.respond = function(query, channel, bot) {
	//just gets the first result
	var page = 0; //looks like 4 results each 'page'
	this.request("http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + (query.replace(/\s/g, '+')) + "&start=" + page, function(err, res, body) {
		var data, error;
		try {
			data = JSON.parse(body);
		} catch (error) {
			console.log(error)
			return;
		}
		if(!data.responseData){
			bot.sendMessage(channel, "Error:\n" + data.responseDetails);
		}
		else if (!data.responseData || data.responseData.results.length == 0){
			bot.sendMessage(channel, "No result for '" + query + "'");

			return
		}
		else if("unescapedUrl" in data.responseData.results[0]){
			bot.sendMessage(channel, data.responseData.results[0].unescapedUrl);
		}
	});
	
}

GoogleImagePlugin.prototype._stripCommand = function(message) {
	if (this.options.command && message && message.toLowerCase().indexOf(this.options.command.toLowerCase() + " ") == 0) {
		return message.substring(this.options.command.length + 1);
	}
	return null;
}

module.exports = GoogleImagePlugin;