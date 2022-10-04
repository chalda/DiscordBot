exports.commands = [
	"pullanddeploy",
	"version",
	"myid",
	"userid"
]

//a collection of commands primarily useful for developers

exports.pullanddeploy = {
	description: "bot will perform a git pull master and restart with the new code",
	process: function(bot,msg,suffix) {
		msg.channel.send("fetching updates...").then(function(sentMsg){
			console.log("updating...");
			var spawn = require('child_process').spawn;
			var log = function(err,stdout,stderr){
				if(stdout){console.log(stdout);}
				if(stderr){console.log(stderr);}
			};
			var fetch = spawn('git', ['fetch']);
			fetch.stdout.on('data',function(data){
				console.log(data.toString());
			});
			fetch.on("close",function(code){
				var reset = spawn('git', ['reset','--hard','origin/master']);
				reset.stdout.on('data',function(data){
					console.log(data.toString());
				});
				reset.on("close",function(code){
					var npm = spawn('npm', ['install']);
					npm.stdout.on('data',function(data){
						console.log(data.toString());
					});
					npm.on("close",function(code){
						console.log("goodbye");
						sentMsg.edit("brb!").then(function(){
							bot.destroy().then(function(){
								process.exit();
							});
						});
					});
				});
			});
		});
	}
}

exports.version = {
	description: "returns the git commit this bot is running",
	process: function(bot,msg,suffix) {
		var commit = require('child_process').spawn('git', ['log','-n','1']);
		commit.stdout.on('data', function(data) {
			let str = data.toString();
			if(str){
				msg.channel.send(str);
			}
		});
		commit.on('close',function(code) {
			if( code != 0){
				msg.channel.send("failed checking git version!");
			}
		});
	}
}

exports.myid = {
	description: "returns the user id of the sender",
	process: function(bot,msg){
		msg.channel.send(msg.author.id);
	}
}

exports.userid = {
	usage: "[user to get id of]",
	description: "Returns the unique id of a user. This is useful for permissions.",
	process: function(bot,msg,suffix) {
		if(msg.mentions.members.size > 0){
			if(msg.mentions.members.size > 1){
				var response = "multiple users found:";
				for(id of msg.mentions.members.keys()){
					response += "\nThe id of <@" + id + "> is " + id;
				}
				msg.channel.send(response);
			} else {
				let id = msg.mentions.members.firstKey();
				msg.channel.send("\nThe id of <@" + id + "> is " + id);
			}
		} else if(suffix){
			var users = msg.channel.guild.members.cache.filter((member) => member.user.username == suffix).array();
			if(users.length == 1){
				msg.channel.send( "The id of " + users[0].user.username + " is " + users[0].user.id)
			} else if(users.length > 1){
				var response = "multiple users found:";
				for(var i=0;i<users.length;i++){
					var user = users[i];
					response += `The id of ${user} is ${user.id}`;
				}
				msg.channel.send(response);
			} else {
				msg.channel.send("No user " + suffix + " found!");
			}
		} else {
			msg.channel.send( `The id of ${msg.author} is ${msg.author.id}`);
		}
	}
}

