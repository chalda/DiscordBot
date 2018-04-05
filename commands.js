commands = {	
	"alias": {
		usage: "<name> <actual command>",
		description: "Creates command aliases. Useful for making simple commands on the fly",
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				msg.channel.send(Config.commandPrefix + "alias " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				msg.channel.send("overwriting commands with aliases is not allowed!");
			} else {
				var command = args.shift();
				aliases[name] = [command, args.join(" ")];
				//now save the new alias
				require("fs").writeFile("./alias.json",JSON.stringify(aliases,null,2), null);
				msg.channel.send("created alias " + name);
			}
		}
	},
	"aliases": {
		description: "lists all recorded aliases",
		process: function(bot, msg, suffix) {
			var text = "current aliases:\n";
			for(var a in aliases){
				if(typeof a === 'string')
					text += a + " ";
			}
			msg.channel.send(text);
		}
	},
    "ping": {
        description: "responds pong, useful for checking if bot is alive",
        process: function(bot, msg, suffix) {
            msg.channel.send( msg.author+" pong!");
            if(suffix){
                msg.channel.send( "note that !ping takes no arguments!");
            }
        }
    },
    "idle": {
		usage: "[status]",
        description: "sets bot status to idle",
        process: function(bot,msg,suffix){ 
	    bot.user.setStatus("idle").then(console.log).catch(console.error);
	}
    },
    "online": {
		usage: "[status]",
        description: "sets bot status to online",
        process: function(bot,msg,suffix){ 
	    bot.user.setStatus("online").then(console.log).catch(console.error);
	}
    },
    "say": {
        usage: "<message>",
        description: "bot says message",
        process: function(bot,msg,suffix){ msg.channel.send(suffix);}
    },
	"announce": {
        usage: "<message>",
        description: "bot says message with text to speech",
        process: function(bot,msg,suffix){ msg.channel.send(suffix,{tts:true});}
    },
	"msg": {
		usage: "<user> <message to leave user>",
		description: "leaves a message for a user the next time they come online",
		process: function(bot,msg,suffix) {
			var args = suffix.split(' ');
			var user = args.shift();
			var message = args.join(' ');
			if(user.startsWith('<@')){
				user = user.substr(2,user.length-3);
			}
			var target = msg.channel.guild.members.find("id",user);
			if(!target){
				target = msg.channel.guild.members.find("username",user);
			}
			messagebox[target.id] = {
				channel: msg.channel.id,
				content: target + ", " + msg.author + " said: " + message
			};
			updateMessagebox();
			msg.channel.send("message saved.")
		}
	},
	"eval": {
		usage: "<command>",
		description: 'Executes arbitrary javascript in the bot process. User must have "eval" permission',
		process: function(bot,msg,suffix) {
			let result = eval(suffix,bot).toString();
			if(result) {
				msg.channel.send(result);
			}
		}
	},
	"cmdauth": {
		usage: "<userid> <get/toggle> <command>",
		description: "Gets/Toggles command usage permission for the specified user",
		process: function(bot,msg,suffix) {
			var Permissions = require("./permissions.json");
			var fs = require('fs');

			var args = suffix.split(' ');
			var userid = args.shift();
			var action = args.shift();
			var cmd = args.shift();

			if(userid.startsWith('<@')){
				userid = userid.substr(2,userid.length-3);
			}

			var target = msg.channel.guild.members.find("id",userid);
			if(!target) {
				msg.channel.send("Could not find user");
			} else {
				if(commands[cmd] || cmd === "*") {
					var canUse = Permissions.checkPermission(userid,cmd);
					var strResult;
					if(cmd === "*") {
						strResult = "all commands"
					} else {
						strResult = 'command "' + cmd + '"';
					}
					if(action.toUpperCase() === "GET") {
						msg.channel.send("User permission for " + strResult + " is " + canUse);
					} else if(action.toUpperCase() === "TOGGLE") {
						if(Permissions.users.hasOwnProperty(userid)) {	
							Permissions.users[userid][cmd] = !canUse;
						}
						else {
							Permissions.users[userid].append({[cmd] : !canUse});
						}
						fs.writeFile("./permissions.json",JSON.stringify(Permissions,null,2));
						
						msg.channel.send("User permission for " + strResult + " set to " + Permissions.users[userid][cmd]);
					} else {
						msg.channel.send('Requires "get" or "toggle" parameter');
					}
				} else {
					msg.channel.send("Invalid command")
				}				
			}		
		}
	}
};