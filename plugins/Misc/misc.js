exports.commands = [
	"mixer",
	"chuckNorris",
	"watchtogether"
]

//a collection of simple self contained commands with no dependencies beyond request

exports.mixer = {
	usage: "<stream>",
	description: "checks if the given Mixer stream is online",
	process: function(bot,msg,suffix){
		require("request")("https://mixer.com/api/v1/channels/"+suffix,
		function(err,res,body){
			var data = JSON.parse(body);
			if(data && data.online){
				msg.channel.send( suffix
					+" is online"
					+"\n"+data.thumbnail.url)
			}else{
				msg.channel.send( suffix+" is offline")
			}
		});
	}
}

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
