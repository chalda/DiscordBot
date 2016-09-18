var request = require("request");
var AuthDetails = require("../../auth.json");

exports.commands = [
	"image", //gives top image from google search
	"rimage", //gives random image from google search
	"ggif" //gives random gif from google search
];

exports.image = {
	usage: "<search query>",
	description: "gets the top matching image from google",
	process: function(bot, msg, args) {
		if(!AuthDetails || !AuthDetails.youtube_api_key || !AuthDetails.google_custom_search){
			msg.channel.sendMessage("Image search requires both a YouTube API key and a Google Custom Search key!");
			return;
		}
		//gets us a random result in first 5 pages
		var page = 1; //we request 10 items
		request("https://www.googleapis.com/customsearch/v1?key=" + AuthDetails.youtube_api_key + "&cx=" + AuthDetails.google_custom_search + "&q=" + (args.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=10&start="+page, function(err, res, body) {
			var data, error;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.log(error)
				return;
			}
			if(!data){
				console.log(data);
				msg.channel.sendMessage( "Error:\n" + JSON.stringify(data));
				return;
			}
			else if (!data.items || data.items.length == 0){
				console.log(data);
				msg.channel.sendMessage( "No result for '" + args + "'");
				return;
			}
			var randResult = data.items[0];
			msg.channel.sendMessage( randResult.title + '\n' + randResult.link);
		});
	}
}

exports.rimage = {
	usage: "<search query>",
	description: "gets a random image matching tags from google",
	process: function(bot, msg, args) {
		if(!AuthDetails || !AuthDetails.youtube_api_key || !AuthDetails.google_custom_search){
			msg.channel.sendMessage( "Image search requires both a YouTube API key and a Google Custom Search key!");
			return;
		}
		//gets us a random result in first 5 pages
		var page = 1 + Math.floor(Math.random() * 5) * 10; //we request 10 items
		request("https://www.googleapis.com/customsearch/v1?key=" + AuthDetails.youtube_api_key + "&cx=" + AuthDetails.google_custom_search + "&q=" + (args.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=10&start="+page, function(err, res, body) {
			var data, error;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.log(error)
				return;
			}
			if(!data){
				console.log(data);
				msg.channel.sendMessage( "Error:\n" + JSON.stringify(data));
				return;
			}
			else if (!data.items || data.items.length == 0){
				console.log(data);
				msg.channel.sendMessage( "No result for '" + args + "'");
				return;
			}
			var randResult = data.items[Math.floor(Math.random() * data.items.length)];
			msg.channel.sendMessage( randResult.title + '\n' + randResult.link);
		});
	}
}

exports.ggif = {
	usage : "<search query>",
	description : "get random gif matching tags from google",
	process : function(bot, msg, args) {
		//gets us a random result in first 5 pages
		var page = 1 + Math.floor(Math.random() * 5) * 10; //we request 10 items
		request("https://www.googleapis.com/customsearch/v1?key=" + AuthDetails.youtube_api_key + "&cx=" + AuthDetails.google_custom_search + "&q=" + (args.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=10&start="+page+"&fileType=gif", function(err, res, body) {
			var data, error;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.log(error)
				return;
			}
			if(!data){
				console.log(data);
				msg.channel.sendMessage( "Error:\n" + JSON.stringify(data));
				return;
			}
			else if (!data.items || data.items.length == 0){
				console.log(data);
				msg.channel.sendMessage( "No result for '" + args + "'");
				return;
			}
			var randResult = data.items[Math.floor(Math.random() * data.items.length)];
			msg.channel.sendMessage( randResult.title + '\n' + randResult.link);
		});

	}
}
