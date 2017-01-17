exports.commands = [
	"setUsername",
	"log",
	"uptime"
]

var startTime = Date.now();

exports.setUsername = {
	description: "sets the username of the bot. Note this can only be done twice an hour!",
	process: function(bot,msg,suffix) {
		bot.user.setUsername(suffix);
	}
}

exports.log = {
	usage: "<log message>",
	description: "logs message to bot console",
	process: function(bot,msg,suffix){console.log(msg.content);}
}

exports.uptime = {
	usage: "",
	description: "returns the amount of time since the bot started",
	process: function(bot,msg,suffix){
		var now = Date.now();
		var msec = now - startTime;
		console.log("Uptime is " + msec + " milliseconds");
		var days = Math.floor(msec / 1000 / 60 / 60 / 24);
		msec -= days * 1000 * 60 * 60 * 24;
		var hours = Math.floor(msec / 1000 / 60 / 60);
		msec -= hours * 1000 * 60 * 60;
		var mins = Math.floor(msec / 1000 / 60);
		msec -= mins * 1000 * 60;
		var secs = Math.floor(msec / 1000);
		var timestr = "";
		if(days > 0) {
			timestr += days + " days ";
		}
		if(hours > 0) {
			timestr += hours + " hours ";
		}
		if(mins > 0) {
			timestr += mins + " minutes ";
		}
		if(secs > 0) {
			timestr += secs + " seconds ";
		}
		msg.channel.sendMessage("**Uptime**: " + timestr);
	}
}