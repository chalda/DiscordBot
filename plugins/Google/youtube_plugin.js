var util = require('util');
var youtube_node = require('youtube-node');
var AuthDetails = require("../../auth.json");
var Config = require("../../config.json");


function YoutubePlugin () {
	this.RickrollUrl = 'http://www.youtube.com/watch?v=oHg5SJYRHA0';
	this.youtube = new youtube_node();
	this.youtube.setKey(AuthDetails.youtube_api_key);
	this.youtube.addParam('type', 'video');
};


YoutubePlugin.prototype.respond = function (query, channel, bot) {
	this.youtube.search(query, 1, function(error, result) {
			if (error) {
				channel.send(`${error.code}: ${error.message}`);
			}
			else {
				if (!result || !result.items || result.items.length < 1) {
					channel.send("There were no results.");
				} else {
					channel.send("http://www.youtube.com/watch?v=" + result.items[0].id.videoId );
				}
			}
		});

};


module.exports = YoutubePlugin;
