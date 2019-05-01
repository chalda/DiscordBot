const crypto = require("crypto");
exports.commands = [
    "create",
    //"voice",
    "delete",
    "pub",
    "priv",
    //"invite",
    //"uninvite",
    "servers",
    "topic"
];

exports.create = {
    usage: "<channel name>",
    description: "creates a temporary text channel.",
    process: function (bot, msg, suffix) {
        let xrandr = crypto.randomBytes(3).toString('hex');
        msg.channel.guild.createChannel("tmp" + xrandr, "text").then(function (channel) {
            channel.overwritePermissions(msg.channel.guild.defaultRole, { "VIEW_CHANNEL": false, "READ_MESSAGES": false });
            channel.overwritePermissions(msg.author, { "SEND_TTS_MESSAGES": true, "MANAGE_MESSAGES": true, "VIEW_CHANNEL": true, "READ_MESSAGES": true });
            channel.overwritePermissions(bot.user, { "SEND_TTS_MESSAGES": false, "MANAGE_MESSAGES": true, "VIEW_CHANNEL": true, "READ_MESSAGES": true });
            msg.channel.send("created " + channel);
            channel.setTopic(suffix)
        }).catch(function (error) {
            msg.channel.send("failed to create channel: " + error);
        });
    }
};

exports.servers = {
    description: "Tells you what servers the bot is in",
    process: function (bot, msg) {
        //msg.channel.send(`__**${bot.user.username} is currently on the following servers:**__ \n\n${bot.guilds.map(g => `${g.name} - **${g.memberCount} Members**`).join(`\n`)}`, {split: true});
        msg.channel.send("No.");
    }
};

exports.voice = {
    usage: "",
    description: "creates a temporary voice channel.",
    process: function (bot, msg, suffix) {
        let xrandr = crypto.randomBytes(3).toString('hex');
        msg.channel.guild.createChannel("tmp" + xrandr, "voice").then(function (channel) {
            msg.channel.send("created " + channel.id);
            channel.overwritePermissions(msg.author, { "PRIORITY_SPEAKER": true });
            console.log("created " + channel);
        }).catch(function (error) {
            msg.channel.send("failed to create channel: " + error);
        });
    }
};
exports["delete"] = {
    usage: "",
    description: "deletes the specified channel",
    process: function (bot, msg, suffix) {
        var channel = msg.channel;
        if (isOwner(msg)) {
            channel.delete().then(function (channel) {
                console.log("deleted " + suffix + " at " + msg.author + "'s request");
            }).catch(function (error) {
                msg.channel.send("couldn't delete channel: " + error);
            });
        } else { msg.channel.send("You can't delete a channel you don't own, " + msg.author + "!").then(function (vx) { msg.delete(); vx.delete(10000) }) }
    }
};
exports["pub"] = {
    usage: "",
    description: "publifies the current channel",
    process: function (bot, msg, suffix) {
        var channel = msg.channel;
        if (isOwner(msg)) {
            channel.overwritePermissions(msg.channel.guild.defaultRole, { "VIEW_CHANNEL": true, "READ_MESSAGES": true });
        } else { msg.channel.send("You can't publify a channel you don't own, " + msg.author + "!").then(function (vx) { msg.delete(); vx.delete(10000) }) }
    }
};
exports["priv"] = {
    usage: "",
    description: "privifies the current channel",
    process: function (bot, msg, suffix) {
        var channel = msg.channel;
        if (isOwner(msg)) {
            channel.overwritePermissions(msg.channel.guild.defaultRole, { "VIEW_CHANNEL": false, "READ_MESSAGES": false });
        } else { msg.channel.send("You can't privify a channel you don't own, " + msg.author + "!").then(function (vx) { msg.delete(); vx.delete(10000) }) }
    }
};
exports["invite"] = {
    usage: "<@ user>",
    description: "adds a user to the current channel, one at a time",
    process: function (bot, msg, suffix) {
        var channel = msg.channel;
        if (isOwner(msg)) {
            var args = suffix.split(' ');
			var user = args.shift();
			var message = args.join(' ');
			if(user.startsWith('<@')){
				user = user.substr(2,user.length-3);
			}
            var target = msg.channel.guild.members.find("id",user);
            channel.overwritePermissions(target, { "VIEW_CHANNEL": true, "READ_MESSAGES": true });
            msg.channel.send(msg.author + ", I have addified those you have requested to the channel.").then(function (vx) { vx.delete(10000) })
        } else { msg.channel.send("You can't addify someone to a channel you don't own, " + msg.author + "!").then(function (vx) { msg.delete(); vx.delete(10000) }) }
    }
};
exports["uninvite"] = {
    usage: "<@ user>",
    description: "yeets a user from the current channel, one at a time",
    process: function (bot, msg, suffix) {
        var channel = msg.channel;
        if (isOwner(msg)) {
            var args = suffix.split(' ');
			var user = args.shift();
			var message = args.join(' ');
			if(user.startsWith('<@')){
				user = user.substr(2,user.length-3);
			}
            var target = msg.channel.guild.members.find("id",user);
            channel.overwritePermissions(target, { "VIEW_CHANNEL": false, "READ_MESSAGES": false });
            msg.channel.send(msg.author + ", I have yeachetified those you have requested to the channel.").then(function (vx) { vx.delete(10000) })
        } else { msg.channel.send("You can't yeetify someone from a channel you don't own, " + msg.author + "!").then(function (vx) { msg.delete(); vx.delete(10000) }) }
    }
};

exports.topic = {
    usage: "[topic]",
    description: 'Sets the topic for the channel. No topic removes the topic.',
    process: function (bot, msg, suffix) {
        var channel = msg.channel;
        if (isOwner(msg)) {
            msg.channel.setTopic(suffix)
        } else { msg.channel.send("You can't change the topic a channel you don't own, " + msg.author + "!").then(function (vx) { msg.delete(); vx.delete(10000) }) }
    }
}
function isOwner(msg) {
    return ((msg.channel.permissionsFor(msg.author).has("MANAGE_MESSAGES")
        || msg.channel.permissionsFor(msg.author).has("PRIORITY_SPEAKER")
        || msg.channel.permissionsFor(msg.author).has("ADMINISTRATOR"))
        && msg.channel.name.startsWith("tmp"))
}
