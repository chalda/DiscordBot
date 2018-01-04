var fs = require('fs');
var epoc = 945000; //15 minutes in milliseconds
var dayLimit = 1210000000; //14 days in milliseconds

process.on('unhandledRejection', (reason) => {
  console.error(reason);
  process.exit(1);
});

try {
	var Discord = require("discord.js");
} catch (e){
	console.log(e.stack);
	console.log(process.version);
	console.log("Please run npm install and ensure it passes with no errors!");
	process.exit();
}
console.log("Starting DiscordBot\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);



// Get authentication data
try {
	var AuthDetails = require("./auth.json");
} catch (e){
	console.log("Please create an auth.json like auth.json.example with a bot token or an email and password.\n"+e.stack);
	process.exit();
}

// Load custom permissions
var dangerousCommands = ["eval","pullanddeploy","setUsername"];
var Permissions = {};
try{
	Permissions = require("./permissions.json");
} catch(e){
	Permissions.global = {};
	Permissions.users = {};
    Permissions.roles = {};
}

for( var i=0; i<dangerousCommands.length;i++ ){
	var cmd = dangerousCommands[i];
	if(!Permissions.global.hasOwnProperty(cmd)){
		Permissions.global[cmd] = false;
	}
}
Permissions.checkPermission = function (msg,permission){
    console.log('User ID of person running command: '+msg.author.id+' username: '+msg.author.username);
    try {
		var allowed = true;
		try{
			if(Permissions.global.hasOwnProperty(permission)){
				allowed = Permissions.global[permission] === true;
			}
		} catch(e){}
		try{
			if(Permissions.users[msg.author.id].hasOwnProperty(permission)){
				allowed = Permissions.users[msg.author.id][permission] === true;
                return allowed;
			}
		} catch(e){}
        try{
            if(typeof msg.member != 'undefined'){
                var roles = msg.member.roles;
                //console.log("contents of roles: "+roles);
                for (let rol of roles){
                    //console.log("Content of rol: "+rol[0]+" typeof rol: "+typeof rol);
                    try{
                        if(Permissions.roles[rol[0]].hasOwnProperty(permission)){
                            allowed = Permissions.roles[rol[0]][permission] === true;
                            break;
                        }
                    }catch(e){}
                }
            }
        } catch(e){ console.log("Error Role perm: "+e); }
		return allowed;
	} catch(e){}
	return false;
}
fs.writeFile("./permissions.json",JSON.stringify(Permissions,null,2));

//load config data
var Config = {};
try{
	Config = require("./config.json");
} catch(e){ //no config file, use defaults
	Config.debug = false;
	Config.commandPrefix = '!';
	try{
		if(fs.lstatSync("./config.json").isFile()){
			console.log("WARNING: config.json found but we couldn't read it!\n" + e.stack);
		}
	} catch(e2){
		fs.writeFile("./config.json",JSON.stringify(Config,null,2));
	}
}
if(!Config.hasOwnProperty("commandPrefix")){
	Config.commandPrefix = '!';
}

var messagebox;
var aliases;
try{
	aliases = require("./alias.json");
} catch(e) {
	//No aliases defined
	aliases = {};
}

var commands = {	
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
	    bot.user.setStatus("idle");
	    bot.user.setGame(suffix).catch(err => console.log(err));
	}
    },
    "online": {
				usage: "[status]",
        description: "sets bot status to online",
        process: function(bot,msg,suffix){ 
	    bot.user.setStatus("online");
	    bot.user.setGame(suffix).catch(err => console.log(err));
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
			if(Permissions.checkPermission(msg.author,"eval")){
				msg.channel.send( eval(suffix,bot));
			} else {
				msg.channel.send( msg.author + " doesn't have permission to execute eval!");
			}
		}
	}
};

if(AuthDetails.hasOwnProperty("client_id")){
	commands["invite"] = {
		description: "generates an invite link you can use to invite the bot to your server",
		process: function(bot,msg,suffix){
			msg.channel.send("invite link: https://discordapp.com/oauth2/authorize?&client_id=" + AuthDetails.client_id + "&scope=bot&permissions=470019135");
		}
	}
}


try{
	messagebox = require("./messagebox.json");
} catch(e) {
	//no stored messages
	messagebox = {};
}
function updateMessagebox(){
	require("fs").writeFile("./messagebox.json",JSON.stringify(messagebox,null,2), null);
}

var bot = new Discord.Client();

bot.on("ready", function () {
	console.log("Logged in! Serving in " + bot.guilds.array().length + " servers");
	require("./plugins.js").init();
	console.log("type "+Config.commandPrefix+"help in Discord for a commands list.");
	bot.user.setGame(Config.commandPrefix+"help | " + bot.guilds.array().length +" Servers"); 
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error

});

function checkMessageForCommand(msg, isEdit) {
	//check if message is a command
	if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
        //console.log("Message.member.user.id "+msg.member.user.id+" Message.member.user.username "+msg.member.user.username);
		var cmdTxt = msg.content.split(" ")[0].substring(Config.commandPrefix.length);
        var suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1);//add one for the ! and one for the space
        //suffix = suffix.split(" ");
        if(msg.isMentioned(bot.user)){
			try {
				cmdTxt = msg.content.split(" ")[1];
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+Config.commandPrefix.length+1);
			} catch(e){ //no command
				msg.channel.send("Yes?");
				return;
			}
        }
		alias = aliases[cmdTxt];
		if(alias){
			console.log(cmdTxt + " is an alias, constructed command is " + alias.join(" ") + " " + suffix);
			cmdTxt = alias[0];
			suffix = alias[1] + " " + suffix;
		}
		var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
						if(suffix){
							var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
							var info = "";
							for(var i=0;i<cmds.length;i++) {
								var cmd = cmds[i];
								info += "**"+Config.commandPrefix + cmd+"**";
								var usage = commands[cmd].usage;
								if(usage){
									info += " " + usage;
								}
								var description = commands[cmd].description;
								if(description instanceof Function){
									description = description();
								}
								if(description){
									info += "\n\t" + description;
								}
								info += "\n"
							}
							msg.channel.send(info);
						} else {
							msg.author.send("**Available Commands:**").then(function(){
								var batch = "";
								var sortedCommands = Object.keys(commands).sort();
								for(var i in sortedCommands) {
									var cmd = sortedCommands[i];
                                    cmds = cmd.replace(/_/g," ");
                                    console.log(i+": "+cmd)
									var info = "**"+Config.commandPrefix + cmds+"**";
									var usage = commands[cmd].usage;
									if(usage){
										info += " " + usage;
									}
									var description = commands[cmd].description;
									if(description instanceof Function){
										description = description();
									}
									if(description){
										info += "\n\t" + description;
									}
									var newBatch = batch + "\n" + info;
									if(newBatch.length > (1024 - 8)){ //limit message length
										msg.author.send(batch);
										batch = info;
									} else {
										batch = newBatch
									}
								}
								if(batch.length > 0){
									msg.author.send(batch);
								}
						});
					}
        }
		else if(cmd) {
			if(Permissions.checkPermission(msg,cmdTxt)){
				try{
					cmd.process(bot,msg,suffix,isEdit);
				} catch(e){
					var msgTxt = "command " + cmdTxt + " failed :(";
					if(Config.debug){
						 msgTxt += "\n" + e.stack;
					}
					msg.channel.send(msgTxt);
				}
			} else {
				msg.channel.send("You are not allowed to run " + cmdTxt + "!");
			}
		} else {
			msg.channel.send(cmdTxt + " not recognized as a command!").then((message => message.delete(5000)))
		}
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }

        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                msg.channel.send("yes?"); //using a mention here can lead to looping
        } else {

				}
    }
}

bot.on("message", (msg) => {
       checkMessageForCommand(msg, false);
       //console.log('Checking Message Channel: '+msg.channel);
       if(msg.author != bot.user && msg.content.startsWith('!')){
       msg.delete(2000).catch(err => console.log('Error occursed at:' +err+ 'skipping msg'));
       } else if(msg.author == bot.user && msg.content.startsWith('__')){
       msg.delete(2000).catch(err => console.log('Error occured at: '+err+' skipping msg'));
       }
       //console.log(bot.users.get('390062678363734026').username);
});
bot.on("messageUpdate", (oldMessage, newMessage) => {
	checkMessageForCommand(newMessage,true);
});

var blackList = "";
var channels = [];

function purgeOld(){
    var guild = bot.guilds.array();
    for(let gu of guild){
        gut = gu.channels.array();
        chan = require("./guilds/"+gu.name+".json");
        //console.log();
         for(let ch of gut){
             if(ch.type == "text"){
                 try{
                     for(let cha of chan.purge){
                         //console.log('in for of');
                     if(ch.name == cha.channel && !blackList.includes(ch.name)){
                         //console.log(ch.name+' = '+cha.channel);
                         channels.push(ch);
                         blackList += ch.name+" ";
                     }
                     }
                 }catch(err){
                     //console.log('Error occured at: '+err);
                 }
             }
         }
        break;
         }
    for(var i = 0; i < channels.length; i++){
    channels[i].fetchMessages().then((msg) => {
                                 //console.log(msg);
                                 for(let link of msg.array()){
                                 //console.log('Link var for msg: '+link);
                                 if(link.createdTimestamp < Date.now()-epoc){
                                 link.delete().catch((err) => { console.log('Error has occured at: '+err); });
                                 }
                                 }
                                 }).catch((err)=>{
                                          console.log('Error occured at: '+err);
                                          });
    }
}

setInterval(purgeOld, 6000);

//Create Guild file on client first join
bot.on("guildCreate", function(guild){
        var Guild = {}
        try{
            Guild = require("./guilds/"+ guild.name +".json");
        } catch(e){ //no config file, use defaults
            Guild.community = '';
            Guild.commid = '';
            Guild.client_id = '';
            Guild.secret = '';
            Guild.bearer = '';
            try{
                if(fs.lstatSync("./guilds/"+ guild.name +".json").isFile()){
                    console.log("WARNING: Guild File found but we couldn't read it!\n" + e.stack);
                }
            } catch(e2){
                fs.writeFile("./guilds/"+ guild.name +".json",JSON.stringify(Guild,null,2));
            }
        }
});

//Log user status changes
bot.on("presence", function(user,status,gameId) {
	//if(status === "online"){
	//console.log("presence update");
	console.log(user+" went "+status);
	//}
	try{
	if(status != 'offline'){
		if(messagebox.hasOwnProperty(user.id)){
			console.log("found message for " + user.id);
			var message = messagebox[user.id];
			var channel = bot.channels.get("id",message.channel);
			delete messagebox[user.id];
			updateMessagebox();
			bot.send(channel,message.content);
		}
	}
	}catch(e){}
});


exports.addCommand = function(commandName, commandObject){
    try {
        commands[commandName] = commandObject;
    } catch(err){
        console.log(err);
    }
}
exports.commandCount = function(){
    return Object.keys(commands).length;
}
if(AuthDetails.bot_token){
	console.log("logging in with token");
	bot.login(AuthDetails.bot_token);
} else {
	console.log("Logging in with user credentials is no longer supported!\nYou can use token based log in with a user account, see\nhttps://discord.js.org/#/docs/main/master/general/updating");
}
