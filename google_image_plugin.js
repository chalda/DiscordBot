var util = require('util');
var winston = require('winston');
var AuthDetails = require("./auth.json");

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
	if(!AuthDetails || !AuthDetails.youtube_api_key || !AuthDetails.google_custom_search){
		bot.sendMessage(channel, "Image search requires both a YouTube API key and a Google Custom Search key!");
		return;
	}
	//just gets the first result
	this.request("https://www.googleapis.com/customsearch/v1?key=" + AuthDetails.youtube_api_key + "&cx=" + AuthDetails.google_custom_search + "&q=" + (query.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=1&start=1", function(err, res, body) {
		var data, error;
		try {
			data = JSON.parse(body);
		} catch (error) {
			console.log(error)
			return;
		}
		if(!data.responseData){
			console.log(data);
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