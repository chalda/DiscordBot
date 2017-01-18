
exports.commands = [
	"rd",
	"ry",
	"rmath"
]

exports.rmath = {
	usage: "<random math>",
	description: "Gives a Random Math Fact",
	process: function(bot, msg, suffix) {
			require("request")("http://numbersapi.com/random/math?json",
					function(err, res, body) {
							var data = JSON.parse(body);
							if (data && data.text) {
									msg.channel.sendMessage(data.text)}
					});
	}
},

exports.ry = {
usage: "<random year>",
description: "Gives a Random Year Fact",
process: function(bot, msg, suffix) {
require("request")("http://numbersapi.com/random/year?json",
function(err, res, body) {
	var data = JSON.parse(body);
	if (data && data.text) {
			msg.channel.sendMessage(data.text)}
});
}
},


				exports.rd = {
								usage: "<random date>",
								description: "Gives a Random Date Fact",
								process: function(bot, msg, suffix) {
										require("request")("http://numbersapi.com/random/date?json",
												function(err, res, body) {
														var data = JSON.parse(body);
														if (data && data.text) {
																msg.channel.sendMessage(data.text)}
												});
								}
						}
