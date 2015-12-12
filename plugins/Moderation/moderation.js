exports.commands = [
	"votekick",
	"kick",
	"bans"
]

var votekicks = {};

function usersOnline(server){
	var online = 0;
	for(var i = 0; i < server.members.length; i++){
		if(server.members[i].status != 'offline') online += 1;
	}
	return online;
}

exports.votekick = {
	usage: "<user|user id>",
	description: "Vote to kick a user. Requires the majority of online users to vote for the kick, and always at least 2 users",
	process: function(bot,msg,suffix) {
		if(suffix){
			//first check if the bot can kick
			if(!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")){
				bot.sendMessage(msg.channel, "I don't have permission to kick people!");
				return;
			}
			var vote = function(user){
				if(votekicks.hasOwnProperty(user.id)){
					var votes = votekicks[user.id];
					votes.count += 1;
					if(votes.voters.indexOf(msg.author.id) > -1){
						bot.sendMessage(msg.channel,msg.author + " you can only vote once!");
						return;
					}
					votes.voters.push(msg.author.id);
					if(votes.count > usersOnline(msg.channel.server)/2){
						bot.sendMessage(msg.channel,"Vote passed!\nKicking " + user + " from " + msg.channel.server + "!",
							function() {
								bot.kickMember(users[0],msg.channel.server);
						});
					}
				} else {
					votekicks[user.id] = { count:1, voters:[msg.author.id]};
					bot.sendMessage(msg.channel,"Starting votekick for user " + user + "!");
				}
			};
			if(suffix.startsWith("<@")){
				suffix = suffix.substr(2,suffix.length-3);
			}
			var user = msg.channel.server.members.get("id",suffix);
			if(user){
				vote(user);
				return;
			}
			var users = msg.channel.server.members.getAll("username",suffix);
			if(users.length > 1){
				bot.sendMessage(msg.channel,"Multiple people match " + suffix + "!")
			} else if(users.length == 1){
				vote(users[0]);
			} else {
				bot.sendMessage(msg.channel,"I couldn't find a user " + suffix);
			}
		} else {
			bot.sendMessage(msg.channel,"You must specify a user to kick!");
		}
	}
}

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