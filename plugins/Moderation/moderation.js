//None of these commands actually work. Disabling them for now
/*exports.commands = [
	"myid",
	"perm",
	"votekick",
	"kick"
]*/

var votekicks = {};

function usersOnline(server){
	var online = 0;
	for(var i = 0; i < server.members.length; i++){
		if(server.members[i].status != 'offline') online += 1;
	}
	return online;
}

function resolveUser(msgContext,usertxt){
	var userid = usertxt;
	if(usertxt.startsWith('<@')){
		userid = usertxt.substr(2,usertxt.length-3);
	}
	var user = msg.channel.server.members.get("id",userid);
	if(!user){
		var users = msg.channel.server.members.getAll("username",usertxt);
		if(users.length == 1){
			user = users[0];
		}
	}
	return user;
}

exports.myid = {
	description: "returns the user id of the sender",
	process: function(bot,msg){msg.channel.sendMessage(msg.author.id);}
}

exports.perm = {
	usage: "[user]",
	description: "Returns the user's permissions in this channel",
	process: function(bot,msg,suffix) {
		var user = resolveUser(msg,suffix);
		if(!user){
			user = msg.author;
		}
		msg.channel.sendMessage("permissions of " + user + ':\n' + JSON.stringify(msg.channel.permissionsOf(user).serialize(),null,2));
	}
}

exports.votekick = {
	usage: "<user|user id>",
	description: "Vote to kick a user. Requires the majority of online users to vote for the kick, and always at least 2 users",
	process: function(bot,msg,suffix) {
		if(suffix){
			//first check if the bot can kick
			if(!msg.channel.permissionsOf(bot.user).hasPermission("kickMembers")){
				msg.channel.sendMessage( "I don't have permission to kick people!");
				return;
			}
			var vote = function(user){
				if(votekicks.hasOwnProperty(user.id)){
					var votes = votekicks[user.id];
					votes.count += 1;
					if(votes.voters.indexOf(msg.author.id) > -1){
						msg.channel.sendMessage(msg.author + " you can only vote once!");
						return;
					}
					votes.voters.push(msg.author.id);
					if(votes.count > usersOnline(msg.channel.server)/2){
						msg.channel.sendMessage("Vote passed!\nKicking " + user + " from " + msg.channel.server + "!",
							function() {
								bot.kickMember(users[0],msg.channel.server);
						});
					}
				} else {
					votekicks[user.id] = { count:1, voters:[msg.author.id]};
					msg.channel.sendMessage("Starting votekick for user " + user + "!");
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
				msg.channel.sendMessage("Multiple people match " + suffix + "!")
			} else if(users.length == 1){
				vote(users[0]);
			} else {
				msg.channel.sendMessage("I couldn't find a user " + suffix);
			}
		} else {
			msg.channel.sendMessage("You must specify a user to kick!");
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
				msg.channel.sendMessage( "I don't have permission to kick people!");
				return;
			}
			//now check if the user can kick
			if(!msg.channel.permissionsOf(msg.author).hasPermission("kickMembers")){
				msg.channel.sendMessage( "You don't have permission to kick people!");
				return;
			}
			var users = msg.channel.server.members.getAll("username",suffix);
			if(users.length > 1){
				msg.channel.sendMessage("Multiple people match " + suffix + "!")
			} else if(users.length == 1){
				msg.channel.sendMessage("Kicking " + users[0] + " from " + msg.channel.server + "!",
				function() {
					bot.kickMember(users[0],msg.channel.server);
				});
			} else {
				msg.channel.sendMessage("I couldn't find a user " + suffix);
			}
		} else {
			msg.channel.sendMessage("You must specify a user to kick!");
		}
	}
}

exports.bans = {
	description: "returns the list of users who have been banned from this server",
	process: function(bot,msg,suffix){
		bot.getBans(msg.channel.server,function(error,users){
			if(users.length == 0){
				msg.channel.sendMessage("No one has been banned from this server!");
			} else {
				var response = "Banned users:";
				for(var user in users){
					response += "\n" + user.username;
				}
				msg.channel.sendMessage(response);
			}
		});
	}
}

exports.ban = {
	usage: "<user> [days of messages to delete]",
	description: "bans the user, optionally deleting messages from them in the last x days",
	process: function(bot,msg,suffix){
		var args = suffix.split(' ');
		var usertxt = args.shift();
		var days = args.shift();
		var user = resolveUser(msg,usertxt);
		if(user){
			bot.banMember(user,msg.server,days,function(){
				msg.channel.sendMessage("banned user " + user + " id:" + user.id);
			});
		} else {
			msg.channel.sendMessage("couldn't uniquely resolve " + usertxt);
		}
	}
}

exports.unban = {
	usage: "<user>",
	description: "unbans the user.",
	process: function(bot,msg,suffix){
		var args = suffix.split(' ');
		var usertxt = args.shift();
		var days = args.shift();
		var user = resolveUser(msg,usertxt);
		if(user){
			bot.unbanMember(user,msg.server);
		} else {
			bot.sendMessage("couldn't uniquely resolve " + usertxt);
		}
	}
}
