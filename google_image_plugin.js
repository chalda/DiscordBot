var util = require('util');
var winston = require('winston');
var images = require('google-images');



function GoogleImagePlugin () {
	this.images = images
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

	this.images.search(query, function(error, result) {
			if (error) {
				//winston.error("Error querying youtube: " + error);
				bot.sendMessage(channel, "¯\\_(ツ)_/¯");
			}
			else {
				if (!result || result.length < 1) {
					//winston.error("No results from youtube");
					bot.sendMessage(channel, "¯\\_(ツ)_/¯");
				} else {
					bot.sendMessage(channel, result[0].unescapedUrl);
				}
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