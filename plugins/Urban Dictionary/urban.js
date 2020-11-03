var urban = require("urban");
var Discord = require("discord.js");

exports.commands = [
	"urban"
];

exports.urban = {
			usage: "<word>",
			description: "looks up a word on Urban Dictionary",
			process: function(bot,msg,suffix){
					var targetWord = suffix == "" ? urban.random() : urban(suffix);
					targetWord.first(function(json) {
							if (json) {
								messages = [];
								const title = `Urban Dictionary: **${json.word}**`;
								var definition = "Definition: " + json.definition;
								var message = title + "\n\n" + definition;
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
									var example = "__Example__:\n" + json.example;
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
								var followup;
								followup = ()=>{
									if(messages.length > 0){
										msg.channel.send(messages.shift()).then(followup);
									}
								}
								followup();
							} else {
								msg.channel.send( "No matches found");
							}
					});
			}
	}
