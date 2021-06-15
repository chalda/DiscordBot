exports.commands = [
	"wolfram"
]

var wa = require("./wolfram_plugin");
var wolfram_plugin = new wa();

exports.wolfram = {
	usage: "<search terms>",
	description: "gives results from wolfram alpha using search terms",
	process: async function(bot,msg,suffix){
		if(!suffix){
			msg.channel.send("Usage: " + Config.commandPrefix + "wolfram <search terms> (Ex. " + Config.commandPrefix + "wolfram integrate 4x)");
		} else {
			let message = msg.channel.send("*Querying Wolfram Alpha...*");
			wolfram_plugin.respond(suffix,msg.channel,bot,message);
		}
	}
}
