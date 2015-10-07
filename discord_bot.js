/*
	this bot is a ping pong bot, and every time a message
	beginning with "ping" is sent, it will reply with
	"pong".
*/

var Discord = require("discord.js");

var yt = require("./youtube_plugin");
var youtube_plugin = new yt();

var gi = require("./google_image_plugin");
var google_image_plugin = new gi();

// Get the email and password
var AuthDetails = require("./auth.json");
var qs = require("querystring");

var config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "pg-13",
    "url": "http://api.giphy.com/v1/gifs/random",
    "permission": ["NORMAL"]
};


//https://api.imgflip.com/popular_meme_ids
var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716
};


var bot = new Discord.Client();

bot.on("ready", function () {
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
	
});

bot.on("message", function (msg) {

	//if (!help)


	if(msg.content.substring(0, 4) === "!gif"){
		var tags = msg.content.split(" ");
		tags.shift();
		//bot.sendMessage(msg.channel, tags);
		get_gif(tags, function (id) {
            if (typeof id !== "undefined") {

           		bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
            }
            else {
            	bot.sendMessage(msg.channel, "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
            }
        });


	}



	if (msg.content.substring(0, 4) === "ping") {
		
		//send a message to the channel the ping message was sent in.
		bot.sendMessage(msg.channel, msg.sender+" pong!");
		
		//alert the console
		console.log("pong-ed " + msg.sender.username);

	}
	else if (msg.content.substring(0,6) === "!game ") {
		//ask if anyone wants to play the game
		var game = msg.content.substring(6);
		if(game === "cs") {
			game = "Counter-Strike";
		}
		if(game === "hots") {
			game = "Heroes of the Storm";
		}
		if(game === "sc2") {
			game = "Starcraft II";
		}
		bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "?");
		console.log("sent game invites for " + game);
	}
	else if (msg.content.indexOf("dawnbot") > -1) {
		bot.sendMessage(msg.channel, "Hello!");
	}
	else if (msg.isMentioned(bot.user)) {
		var tokens = msg.content.split(" ");
		tokens.shift();
		if (tokens[0] === "servers") {
			bot.sendMessage(msg.channel,bot.servers);
		} else if (tokens[0] === "channels") {
			bot.sendMessage(msg.channel,bot.channels);
		} else if (tokens[0] === "myid") {
			bot.sendMessage(msg.channel,msg.author.id);
		} else if (tokens[0] === "idle") {
			bot.setStatusIdle();
		} else if (tokens[0] === "online") {
			bot.setStatusOnline();
		} else if (tokens[0] === "record") {
			tokens.shift();
			var user = bot.getUser("username",tokens.shift());
			bot.sendMessage(msg.channel,user + "\n" + tokens.join(" "));
		} else {
			bot.sendMessage(msg.channel,msg.author + ", you called?");
		}
	}
	else if(msg.content.substring(0,8) === "!youtube") {
		var tags = msg.content.split(" ");
		tags.shift();
		tags = tags.join(" ");
		youtube_plugin.respond(tags,msg.channel,bot)
		//bot.sendMessage(msg.channel,youtube_plugin.respond(tags));
	}

	else if(msg.content.substring(0,4) === "!say") {
		var tags = msg.content.split(" ");
		tags.shift();
		tags = tags.join(" ");
		bot.sendMessage(msg.channel,tags);
		//bot.sendMessage(msg.channel,youtube_plugin.respond(tags));
	}

	else if(msg.content.substring(0,6) === "!image") {
		var tags = msg.content.split(" ");
		tags.shift();
		tags = tags.join(" ");
		google_image_plugin.respond(tags,msg.channel,bot)
		//bot.sendMessage(msg.channel,youtube_plugin.respond(tags));
	}
	else if(msg.content.substring(0,16) === "!pullanddeploy") {
		bot.sendMessage(msg.channel,"brb!",function(error,sentMsg){
			console.log("updating...");
	                var spawn = require('child_process').spawn;
			spawn('sh', [ 'pullanddeploy.sh' ], {detached: true});
			console.log("restart");
			process.exit()
		});
	}
	else if(msg.content.substring(0,5) === "!meme"){
		var tags = msg.content.split('"');
		var memetype = tags[0].split(" ")[1];
		//bot.sendMessage(msg.channel,tags);
		var Imgflipper = require("imgflipper");
		var imgflipper = new Imgflipper("blahkins", "memepass");
		imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
			//console.log(arguments);
			bot.sendMessage(msg.channel,image);
		});

	}
	else if(msg.content.substring(0,8) === "!version") {
		var commit = require('child_process').spawn('git', ['log','-n','1']);
		commit.stdout.on('data', function(data) {
			bot.sendMessage(msg.channel,data);
		});
		commit.on('close',function(code) {
			if( code != 0){
				bot.sendMessage(msg.channel,"failed checking git version!");
			}
		});
	}
});
 

//This is supposed to message on user sign on, but doessn't work
bot.on("presence", function(data) {
	//if(status === "online"){
	console.log("presence update");
	bot.sendMessage(data.server,data.user+" went "+data.status);
	//}
});

function get_gif(tags, func) {
        var params = {
            "api_key": config.api_key,
            "rating": config.rating,
            "format": "json"
        };
        if (tags !== null) {
            params.tag = tags;
        }

        var query = qs.stringify(params);
//wouldnt see request lib if defined at the top for some reason:\
var request = require("request");

        request(config.url + "?" + query, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                console.error("giphy: Got error: " + body);
            }
            else {
                func(JSON.parse(body).data.id);
            }
        }.bind(this));
    }

bot.login(AuthDetails.email, AuthDetails.password);
