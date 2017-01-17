var urban = require("urban");

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
								var message = "Urban Dictionary: **" +json.word + "**\n\n" + json.definition;
								if (json.example) {
										message = message + "\n\n__Example__:\n" + json.example;
								}
						    msg.channel.sendMessage( message);
							} else {
								msg.channel.sendMessage( "No matches found");
							}
					});
			}
	}
