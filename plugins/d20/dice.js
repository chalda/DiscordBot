exports.commands = [
	"roll", "vroll"
]

var d20 = require('d20')

exports.roll = {
	usage: "[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)",
	description: "roll one die with x sides, or multiple dice using d20 syntax. Default value is 10",
	process: function(bot,msg,suffix) {
		if (suffix.split("d").length <= 1) {
			msg.channel.send(msg.author + " rolled a " + d20.roll(suffix || "10"));
		}
		else if (suffix.split("d").length > 1) {
			var eachDie = suffix.split("+");
			var passing = 0;
			for (var i = 0; i < eachDie.length; i++){
				if (eachDie[i].split("d")[0] < 50) {
					passing += 1;
				};
			}
			if (passing == eachDie.length) {
				msg.channel.send(`${msg.author} rolled a ${d20.roll(suffix)}`);
			}  else {
				msg.channel.send(`${msg.author} tried to roll too many dice at once!`);
			}
		}
	}
}

exports.vroll = {
	usage: "[# of dice]d[# of sides]",
	description: "verbose way to roll multiple of the same die",
	process: function(bot,msg,suffix) {
		msg.channel.send(`${msg.author} rolled ${d20.verboseRoll(suffix)}`);
	}
}
