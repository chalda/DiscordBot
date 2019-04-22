exports.commands = [
	"alexa"
]

//alexa sdk

exports.alexa = {
	usage: "<request...>",
	description: "ask alexa something",
	process: function(bot,msg,suffix){
		/*for now*/ msg.channel.send("Alexa is not yet available. Try again later.")
	}
}