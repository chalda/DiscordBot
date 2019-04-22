const Discord = require("discord.js");
exports.commands = [
	"fight"
]

exports.fight = {
	usage: "<challengee> [challengee]...",
	description: "fite some1",
	process: function(bot,msg,suffix){
		let primitivefighters = suffix.split(" ");
		let fighters = [];
		for (let fighter in primitivefighters) {
			if (fighter instanceof Discord.User) fighters.push(fighter);
		}
		//msg.channel.send("Alexa is not yet available. Try again later.")
		if (fighters) {
			let xrandr = crypto.randomBytes(3).toString('hex');
			msg.channel.guild.createChannel("ftmpf"+xrandr,"text")
			.then(function(channel) {
				channel.overwritePermissions(msg.channel.guild.defaultRole,{"SEND_MESSAGES":false,"VIEW_CHANNEL":true,"READ_MESSAGES":true,"ADD_REACTIONS":false});
				channel.overwritePermissions(msg.author,{"SEND_MESSAGES":true,"VIEW_CHANNEL":true,"READ_MESSAGES":true});
				for (fighter in fighters) {
					channel.overwritePermissions(fighter,{"SEND_MESSAGES":true,"VIEW_CHANNEL":true,"READ_MESSAGES":true});
				};
            	msg.channel.send("created " + channel);
				if (fighters.length = 1) channel.setTopic("Fight between " + msg.author + " and " + fighters[0] "; facilitated by " + bot);
				if (fighters.length > 1) channel.setTopic("Fight between " + msg.author + ", " + fighters.join(", ") + "; facilitated by " + bot);
			}).catch(function(error){
				msg.channel.send("failed to create channel: " + error);
			})
		}
	}
}
