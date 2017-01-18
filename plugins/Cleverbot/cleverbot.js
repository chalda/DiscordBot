exports.commands = [
    "talk"
]

var cleverbot = require("cleverbot-node");
talkbot = new cleverbot;
cleverbot.prepare(function() {});

exports.talk = {
    usage: "<message>",
    description: "Talk directly to the bot",
    process: function(bot, msg, suffix) {
        var conv = suffix.split(" ");
        talkbot.write(conv, function(response) {
            msg.channel.sendMessage("", {
                embed: {
                    color: 0x8698FE,
                    author: {
                        name: msg.author.username,
                        icon_url: msg.author.avatarURL
                    },
                    description: response.message,
                }
            }).catch(console.error);
            msg.react('👌');
        })
    }
}
