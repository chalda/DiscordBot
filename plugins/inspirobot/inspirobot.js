var request = require("request");
var Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require('axios').default;

exports.commands = [
    "inspirobot"
]

exports.inspirobot = {
	description: "returns an inspirational image generated by inspirobot",
	process: function(bot,msg,suffix){
		request({
			url: "http://inspirobot.me/api?generate=true"
		},
		function(err,res,body){
            if(body.length > 0){
                msg.channel.send({
                    embeds: [{
                        "image": {
                            url: body
                        }
                    }]
                });
            } else {
                msg.channel.send("No inspiration to be had :(");
            }
		});
	},
	slashCommand: new SlashCommandBuilder()
        .setName('inspirobot')
        .setDescription("post an inspirational image generated by inspirobot"),
    slashCommandExec: async interaction => {
        const image = await axios.get("http://inspirobot.me/api?generate=true");
        console.log(image.data);
        await interaction.reply({
            embeds: [{
                "image": {
                    url: image.data
                }
            }]
        });
    }
}
