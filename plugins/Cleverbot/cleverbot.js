exports.commands = [
//    "talk"
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
                        name: "Cleverbot",
                        icon_url: "https://lh5.ggpht.com/DiNbF90a-ecMdyG7c49ARdKdm2mlhLDyNswLcmDm3WM6yDADmMMWtTO1XL96-LCEXIc=w300"
                    },
		    timestamp: new Date(),
                    description: response.message,
                }
            }).catch(console.error);
            msg.react('👌');
        })
    }
}
