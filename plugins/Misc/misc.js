const Discord = require("discord.js");

exports.commands = [
	"chuckNorris",
	"watchtogether",
	"lmgtfy"
]

//a collection of simple self contained commands with no dependencies beyond request

exports.chuckNorris = {
	usage: "<joke>",
	description: "gives a random Chuck Norris joke",
	process: function(bot, msg, suffix) {
		require("request")("http://api.icndb.com/jokes/random",
		function(err, res, body) {
			var data = JSON.parse(body);
			if (data && data.value && data.value.joke) {
			msg.channel.send(data.value.joke)
			}
		});
	}
}

exports.watchtogether = {
	usage: "[video url (Youtube, Vimeo)",
	description: "Generate a watch2gether room with your video to watch with your friends!",
	process: function(bot,msg,suffix){
		var watch2getherUrl = "https://www.watch2gether.com/go#";
		msg.channel.send(
			"watch2gether link").then(function(){
				msg.channel.send(watch2getherUrl + suffix)
		})
	}
}

exports.lmgtfy = {
	usage: "<search terms>",
	description: "Generates a disguised Let Me Google That For You link for when you're feeling snarky.",
	process: function(bot, msg, suffix){
		const embed = new Discord.MessageEmbed();
		embed.title = "Click Here";
		embed.url = "https://lmgtfy.com/?q="+encodeURIComponent(suffix);
		msg.channel.send("",embed);
	}
}
