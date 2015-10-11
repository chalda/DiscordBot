var request = require("request");

exports.commands = [
	"image", //gives random image from google search
	"ggif" //gives random gif from google search
];

exports.image = {
	usage : "<search query>",
	description : "gets random image matching tags from google",
	process : function(bot, channel, message, args) {
		//gets us a random result in first 5 pages
		var page = Math.floor(Math.random() * 5)*4;
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
				bot.sendMessage(channel, "No result for '" + message + "'");
				return
			}
			else if("unescapedUrl" in randResult){
				bot.sendMessage(channel, randResult.unescapedUrl);
			}
		});
		
	}
};

exports.ggif = {
	usage : "<search query>",
	description : "get random gif matching tags from google",
	process : function(bot, channel, message, args) {
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
				bot.sendMessage(channel, "No result for '" + message + "'");
				return
			}
			else if("unescapedUrl" in randResult){
				bot.sendMessage(channel, randResult.unescapedUrl);
			}
		});
		
	}
}
