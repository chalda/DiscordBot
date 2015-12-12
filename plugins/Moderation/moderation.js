exports.commands = [
	"kick",
	"bans"
]

exports.kick = {
	usage: "<user>",
	description: "Kick a user with a message! Requires both the author of the message and the bot to have kick permission",
	process: function(bot,msg,suffix) {
		if(suffix){
			//first check if the bot can kick
			if(!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")){
				bot.sendMessage(msg.channel, "I don't have permission to kick people!");
				return;
			}
			//now check if the user can kick
			if(!msg.channel.permissionsOf(msg.author).hasPermission("kickMembers")){
				bot.sendMessage(msg.channel, "You don't have permission to kick people!");
				return;
			}
			var users = msg.channel.server.members.getAll("username",suffix);
			if(users.length > 1){
				bot.sendMessage(msg.channel,"Multiple people match " + suffix + "!")
			} else if(users.length == 1){
				bot.sendMessage(msg.channel,"Kicking " + users[0] + " from " + msg.channel.server + "!",
				function() {
					bot.kickMember(users[0],msg.channel.server);
				});
			} else {
				bot.sendMessage(msg.channel,"I couldn't find a user " + suffix);
			}
		} else {
			bot.sendMessage(msg.channel,"You must specify a user to kick!");
		}
	}
}

exports.bans = {
	description: "returns the list of users who have been banned from this server",
	process: function(bot,msg,suffix){
		bot.getBans(msg.channel.server,function(error,users){
			if(users.length == 0){
				bot.sendMessage(msg.channel,"No one has been banned from this server!");
			} else {
				var response = "Banned users:";
				for(var user in users){
					response += "\n" + user.username;
				}
				bot.sendMessage(msg.channel,response);
			}
		});
	}
}