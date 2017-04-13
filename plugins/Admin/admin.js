exports.commands = [
	"setUsername",
	"log",
	"uptime",
	"alias",
	"aliases",
	"idle",
	"online"
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

	exports.alias = {
		usage: "<name> <actual command>",
		description: "Creates command aliases. Useful for making simple commands on the fly",
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				msg.channel.sendMessage(Config.commandPrefix + "alias " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				msg.channel.sendMessage("overwriting commands with aliases is not allowed!");
			} else {
				var command = args.shift();
				aliases[name] = [command, args.join(" ")];
				//now save the new alias
				require("fs").writeFile("./alias.json",JSON.stringify(aliases,null,2), null);
				msg.channel.sendMessage("created alias " + name);
			}
		}
	}

	exports.aliases = {
		description: "lists all recorded aliases",
		process: function(bot, msg, suffix) {
			var text = "current aliases:\n";
			for(var a in aliases){
				if(typeof a === 'string')
					text += a + " ";
			}
			msg.channel.sendMessage(text);
		}
	}

    exports.idle = {
	usage: "[status]",
        description: "sets bot status to idle",
        process: function(bot,msg,suffix){ 
	    bot.user.setStatus("idle");
	    bot.user.setGame(suffix);
	}
    }

    exports.online = {
	usage: "[status]",
        description: "sets bot status to online",
        process: function(bot,msg,suffix){ 
	    bot.user.setStatus("online");
	    bot.user.setGame(suffix);
	}
    }
