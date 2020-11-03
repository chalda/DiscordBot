exports.commands = [
	"setUsername",
	"log",
	"uptime",
	"userRole"
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
		msg.channel.send("**Uptime**: " + timestr);
	}
}

exports.userRole = {
    usage: "<@user> <@role>",
    description: "Used to toggle @role of specified @user",
    process: function(bot,msg,arg){
        var user, role;
        if(typeof args[0] != 'undefined' && typeof args[1] != 'undefined'){
            try{
                if(msg.mentions.members.first()){ console.log('User mention'); user = msg.mentions.members.first(); }
                if(msg.mentions.roles.first()){ console.log('Role mention '+msg.mentions.roles.first().id); role = msg.mentions.roles.first().id; }
            }catch(err){ console.log('Error occured at: '+err+' Mentions.first() is undefined'); }
				if(user.roles.cache.find(role => role.id === role)){ msg.member.roles.remove(role); msg.channel.send("Removed the role from "+user+".");
				}else{ user.roles.add(role); msg.channel.send("Added the role to "+user+"."); }
        } else{ msg.channel.send('__Parameters can\'t be left blank: USer: '+typeof args[0]+', Role: '+typeof args[1]+'__'); }
	}
}