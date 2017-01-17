exports.commands = [
	"leet"
]

var leet = require("leet");

exports.leet = {
	usage: "<message>",
	description: "converts boring regular text to 1337",
	process: function(bot,msg,suffix){
		msg.channel.sendMessage(leet.convert(suffix));
	}
}
