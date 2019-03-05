exports.commands = [
	"create",
	"voice",
	"delete",
	"servers",
	"topic"
]

exports.create = {
	usage: "<channel name>",
	description: "creates a new text channel with the given name.",
	process: function(bot,msg,suffix) {
		var crypto = require("crypto");
		let xrandr = crypto.randomBytes(3).toString('hex');
		msg.channel.guild.createChannel("tmp"+xrandr,"text").then(function(channel) {
			msg.channel.send("created " + channel);
			channel.overwritePermissions(msg.author,{"SEND_TTS_MESSAGES":true});
		}).catch(function(error){
			msg.channel.send("failed to create channel: " + error);
		});
	}
}

exports.servers = {
description: "Tells you what servers the bot is in",
process: function(bot,msg) {
	//msg.channel.send(`__**${bot.user.username} is currently on the following servers:**__ \n\n${bot.guilds.map(g => `${g.name} - **${g.memberCount} Members**`).join(`\n`)}`, {split: true});
	msg.channel.send("No.");
}
},



exports.voice = {
	usage: "<channel name>",
	description: "creates a new voice channel with the give name.",
	process: function(bot,msg,suffix) {
		var crypto = require("crypto");
		let xrandr = crypto.randomBytes(3).toString('hex');
		msg.channel.guild.createChannel("tmp"+xrandr,"voice").then(function(channel) {
			msg.channel.send("created " + channel.id);
			channel.overwritePermissions(msg.author,{"PRIORITY_SPEAKER":true});
			console.log("created " + channel);
		}).catch(function(error){
			msg.channel.send("failed to create channel: " + error);
		});
	}
},
exports["delete"] = {
	usage: "<channel name>",
	description: "deletes the specified channel",
	process: function(bot,msg,suffix) {
		var channel = msg.channel;
		if (channel.permissionsFor(msg.author).has("SEND_TTS_MESSAGES") || channel.permissionsFor(msg.author).has("PRIORITY_SPEAKER") || channel.permissionsFor(msg.author).has("ADMINISTRATOR")) {
		channel.delete().then(function(channel){
			console.log("deleted " + suffix + " at " + msg.author + "'s request");
		}).catch(function(error){
			msg.channel.send("couldn't delete channel: " + error);
		});} else { msg.channel.send("You can't delete a channel you don't own, "+msg.author+"!").then(function(vx){msg.delete();vx.delete(10000)}) }
	}
}

exports.topic = {
	usage: "[topic]",
	description: 'Sets the topic for the channel. No topic removes the topic.',
	process: function(bot,msg,suffix) {
		msg.channel.setTopic(suffix);
	}
}
