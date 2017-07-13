//None of these commands actually work. Disabling them for now
exports.commands = [
	"myid",
	//"perm",
	//"votekick",
	"kick"
]

var votekicks = {};

function usersOnline(server){
	var online = 0;
	for(var i = 0; i < server.members.length; i++){
		if(server.members[i].status != 'offline') online += 1;
	}
	return online;
}

function resolveMention(usertxt){
	var userid = usertxt;
	if(usertxt.startsWith('<@!')){
		userid = usertxt.substr(3,usertxt.length-4);
	} else {
		if(usertxt.startsWith('<@')){
			userid = usertxt.substr(2,usertxt.length-3);
		}
	}
	return userid;
}

function resolveUser(msgContext,usertxt){
	try {
	var userid = usertxt;
	if(usertxt.startsWith('<@')){
		userid = usertxt.substr(2,usertxt.length-3);
	}
	var user = msgContext.guild.members.get(userid);
	/*if(!user){
		var users = msg.guild.members.findAll("username",usertxt);
		if(users.length == 1){
			user = users[0];
		} else {
			return null;
		}
	}*/
	return user;
	}catch(e){
		console.error(e);
	}
}

exports.myid = {
	description: "returns the user id of the sender",
	process: function(bot,msg){msg.channel.send(msg.author.id);}
}

exports.perm = {
	usage: "[user]",
	description: "Returns the user's permissions in this channel",
	process: function(bot,msg,suffix) {
		var user = resolveUser(msg,suffix);
		if(!user){
			user = msg.author;
		}
		msg.channel.send("permissions of " + user + ':\n' + JSON.stringify(msg.channel.permissionsFor(user).serialize(),null,2));
	}
}

exports.votekick = {
	usage: "<user|user id>",
	description: "Vote to kick a user. Requires the majority of online users to vote for the kick, and always at least 2 users",
	process: function(bot,msg,suffix) {
		if(suffix){
			//first check if the bot can kick
			if(!msg.channel.permissionsFor(bot.user).hasPermission("kickMembers")){
				msg.channel.send( "I don't have permission to kick people!");
				return;
			}
			var vote = function(user){
				if(votekicks.hasOwnProperty(user.id)){
					var votes = votekicks[user.id];
					votes.count += 1;
					if(votes.voters.indexOf(msg.author.id) > -1){
						msg.channel.send(msg.author + " you can only vote once!");
						return;
					}
					votes.voters.push(msg.author.id);
					if(votes.count > usersOnline(msg.channel.server)/2){
						msg.channel.send("Vote passed!\nKicking " + user + " from " + msg.channel.server + "!",
							function() {
								bot.kickMember(users[0],msg.channel.server);
						});
					}
				} else {
					votekicks[user.id] = { count:1, voters:[msg.author.id]};
					msg.channel.send("Starting votekick for user " + user + "!");
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
				msg.channel.send("Multiple people match " + suffix + "!")
			} else if(users.length == 1){
				vote(users[0]);
			} else {
				msg.channel.send("I couldn't find a user " + suffix);
			}
		} else {
			msg.channel.send("You must specify a user to kick!");
		}
	}
}

exports.kick = {
	usage: "<user>",
	description: "Kick a user with a message! Requires both the author of the message and the bot to have kick permission",
	process: function(bot,msg,suffix) {
		let args = suffix.split(" ");
		if(args.length > 0 && args[0]){
			//first check if the bot can kick
			let hasPermissonToKick =  msg.guild.members.get(bot.user.id).permissions.has("KICK_MEMBERS");
			if(!hasPermissonToKick){
				msg.channel.send( "I don't have permission to kick people!");
				return;
			}
			//now check if the user can kick
			if(!msg.guild.members.get(msg.author.id).permissions.has("KICK_MEMBERS")){
				msg.channel.send( "You don't have permission to kick people!");
				return;
			}
			var targetId = resolveMention(args[0]);
			let target = msg.guild.members.get(targetId);
			if(target != undefined){
				if(!target.kickable){
					msg.channel.send("I can't kick " + target + ". Do they have the same or a higher role than me?");
					return;
				}
				if(args.length > 1) {
					let reason = args.slice(1).join(" ");
					target.kick(reason).then(x => {
						msg.channel.send("Kicking " + target + " from " + msg.guild + " for " + reason + "!");
					}).catch(err => msg.channel.send("Kicking " + target + " failed:\n"));
				} else {
					target.kick().then(x => {
						msg.channel.send("Kicking " + target + " from " + msg.guild + "!");
					}).catch(err => msg.channel.send("Kicking " + target + " failed:\n"));
				}
			} else {
				msg.channel.send("I couldn't find a user " + args[0]);
			}
		} else {
			msg.channel.send("You must specify a user to kick!");
		}
	}
}

exports.bans = {
	description: "returns the list of users who have been banned from this server",
	process: function(bot,msg,suffix){
		bot.getBans(msg.channel.server,function(error,users){
			if(users.length == 0){
				msg.channel.send("No one has been banned from this server!");
			} else {
				var response = "Banned users:";
				for(var user in users){
					response += "\n" + user.username;
				}
				msg.channel.send(response);
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
				msg.channel.send("banned user " + user + " id:" + user.id);
			});
		} else {
			msg.channel.send("couldn't uniquely resolve " + usertxt);
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
			bot.send("couldn't uniquely resolve " + usertxt);
		}
	}
}
