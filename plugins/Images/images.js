var request = require("request");
var AuthDetails = require("../../auth.json");

exports.commands = [
	"image", //gives random image from google search
	"ggif" //gives random gif from google search
];

exports.image = {
	usage: "<search query>",
	description: "gets a random image matching tags from google",
	process: function(bot, msg, args) {
		if(!AuthDetails || !AuthDetails.youtube_api_key || !AuthDetails.google_custom_search){
			bot.sendMessage(msg.channel, "Image search requires both a YouTube API key and a Google Custom Search key!");
			return;
		}
		//gets us a random result in first 5 pages
		//var page = Math.floor(Math.random() * 5)*4;
		var page = 1;//just get the first page for now to get this thing working
		request("https://www.googleapis.com/customsearch/v1?key=" + AuthDetails.youtube_api_key + "&cx=" + AuthDetails.google_custom_search + "&q=" + (args.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=1&start=1", function(err, res, body) {
			var data, error;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.log(error)
				return;
			}
			if(!data.responseData){
				console.log(data);
				bot.sendMessage(msg.channel, "Error:\n" + JSON.stringify(data));
				return;
			}
			else if (!data.responseData || data.responseData.results.length == 0){
				bot.sendMessage(msg.channel, "No result for '" + query + "'");
				return;
			}
			var randResult = data.responseData.results[Math.floor(Math.random() * data.responseData.results.length)];
			bot.sendMessage(msg.channel, randResult.unescapedUrl);
		});
	}
}

exports.ggif = {
	usage : "<search query>",
	description : "get random gif matching tags from google",
	process : function(bot, message, args) {
		var page = Math.floor(Math.random() * 5)*4;
		message = message + " filetype:gif"; //this makes google only return gifs
		request("http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + (message.replace(/\s/g, '+')) + "&start=" + page, function(err, res, body) {
			var data, error;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.log(error)
				return;
			}
			var randResult = data.responseData.results[Math.floor(Math.random() * data.responseData.results.length)];
			if (data.responseData.results.length == 0){
				bot.sendMessage(msg.channel, "No result for '" + message + "'");
				return
			}
			else if("unescapedUrl" in randResult){
				bot.sendMessage(msg.channel, randResult.unescapedUrl);
			}
		});
		
	}
}
