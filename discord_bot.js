/*
	this bot is a ping pong bot, and every time a message
	beginning with "ping" is sent, it will reply with
	"pong".
*/

var Discord = require("discord.js");

// Get the email and password
var AuthDetails = require("./auth.json");
var qs = require("querystring");

var config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "pg-13",
    "url": "http://api.giphy.com/v1/gifs/random",
    "permission": ["NORMAL"]
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
		bot.sendMessage(msg.channel, "@"+msg.sender.username+" pong!");
		
		//alert the console
		console.log("pong-ed " + msg.sender.username);

	}
	if (msg.content.substring(0,6) === "!game ") {
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
	if (msg.content.indexOf("dawnbot") > -1) {
		bot.sendMessage(msg.channel, "Hello!");
	}
});
//This is supposed to message on user sign on, but doessn't work
bot.on("presence", function(user, userID, status, rawEvent) {
	if(status === "online"){
		bot.sendMessage({to: userID+"/Cairhien", message: "Greetings!"});
	}
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
