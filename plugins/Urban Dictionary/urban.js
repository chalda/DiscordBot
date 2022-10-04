let urban = require("urban");
let Discord = require("discord.js");

// Disabled because it's broken :(
/* exports.commands = [
	"urban"
]; */

exports.urban = {
			usage: "<word>",
			description: "looks up a word on Urban Dictionary",
			process: function(bot,msg,suffix){
				try {
					let targetWord = suffix == "" ? urban.random() : urban(suffix);
					targetWord.first(function(json) {
							if (json) {
								console.log(JSON.stringify(json));
								messages = [];
								const title = `Urban Dictionary: **${json.word}**`;
								let definition = "Definition: " + json.definition;
								let message = title + "\n\n" + definition;
								if(message.length > 2000){
									messages.push(title);
									while(definition.length > 2000){
										messages.push(definition.slice(0,1999))
										definition = definition.slice(2000);
									}
									messages.push(definition);
								} else {
									messages.push(message);
								}
								if (json.example) {
									let example = "__Example__:\n" + json.example;
									const msg = messages[messages.length - 1] + "\n\n" + example;
									if(msg.length < 2000){
										messages[messages.length - 1] = msg;
									} else {
										while(example.length > 2000){
											messages.push(example.slice(0,1999))
											example = example.slice(2000);
										}
									}
								}
								if(messages.length == 1) {
									// Everything fits in one message so let's get fancy.
									let embed = new Discord.MessageEmbed();
									embed.title = title;
									embed.color = 0x1D2439;
									embed.type = "article";
									embed.url = json.permalink;
									embed.description = definition;
									if(json.example) {
										embed.addField("Example:",json.example, false);
									}
									msg.channel.send({embeds: [embed]});
								} else {
									let followup;
									followup = ()=>{
										if(messages.length > 0){
											msg.channel.send(messages.shift()).then(followup);
										}
									}
									followup();
								}
							} else {
								msg.channel.send( "No matches found");
							}
					});
				} catch (e) {
					console.log(e);
					msg.channel.send("Failed to talk to Urban Dictionary :(");
				}
			}
	}
