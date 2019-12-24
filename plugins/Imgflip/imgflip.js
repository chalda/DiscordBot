exports.commands = [
	"meme"
]

var Config = require("../../config.json");

//https://api.imgflip.com/popular_meme_ids
var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716,
	"awkwardpenguin": 61584
};

exports.meme = {
	usage: 'meme "top text" "bottom text"',
			description: function() {
		var str = "Currently available memes:\n"
		for (var m in meme){
			str += "\t\t" + m + "\n"
		}
		return str;
	},
	process: function(bot,msg,suffix) {
		var tags = msg.content.split('"');
		var memetype = tags[0].split(" ")[1];
		//msg.channel.send(tags);
		var Imgflipper = require("imgflipper");
		var imgflipper = new Imgflipper(process.env.IMGFLIP_USERNAME, process.env.IMGFLIP_PASSWORD);
		imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
			console.log(arguments);
			console.log(image);
			if(image){
			msg.channel.send(image);
		}
		else  {
			msg.channel.send(Config.commandPrefix + "meme <Template> <first text> <last text>");
	}
		});
	}
}
