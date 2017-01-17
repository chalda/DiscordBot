exports.commands = [
	"wolfram"
]

var wa = require("./wolfram_plugin");
var wolfram_plugin = new wa();

exports.wolfram = {
	usage: "<search terms>",
	description: "gives results from wolfram alpha using search terms",
	process: function(bot,msg,suffix){
		if(!suffix){
			msg.channel.sendMessage("Usage: " + Config.commandPrefix + "wolfram <search terms> (Ex. " + Config.commandPrefix + "wolfram integrate 4x)");
		}
		msg.channel.sendMessage("*Querying Wolfram Alpha...*").then(message => {
			wolfram_plugin.respond(suffix,msg.channel,bot,message);
		});
	}
}
