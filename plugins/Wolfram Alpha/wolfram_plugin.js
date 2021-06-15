let Discord = require("discord.js");
let Wolfram = require('node-wolfram');
let AuthDetails = require("../../auth.js").getAuthDetails();

function WolframPlugin() {
	this.wolfram = new Wolfram(AuthDetails.wolfram_api_key)
};

WolframPlugin.prototype.respond = async function (query, channel, bot, tmpMsg) {
	let result;
	try {
		let promise = new Promise((resolve, reject) => {
			this.wolfram.query(query, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			})
		});
		result = await promise;
	} catch (err) {
		console.log(error);
		(await tmpMsg).edit("Couldn't talk to Wolfram Alpha :(");
	}

	

	console.log(JSON.stringify(result));
	if (result.queryresult.$.success == "true") {
		(await tmpMsg).delete();
		if (result.queryresult.hasOwnProperty("warnings")) {
			for (let i in result.queryresult.warnings) {
				for (let j in result.queryresult.warnings[i]) {
					if (j != "$") {
						try {
							await channel.send(result.queryresult.warnings[i][j][0].$.text);
						} catch (e) {
							console.log("WolframAlpha: failed displaying warning:\n" + e.stack());
						}
					}
				}
			}
		}
		if (result.queryresult.hasOwnProperty("assumptions")) {
			for (let i in result.queryresult.assumptions) {
				for (let j in result.queryresult.assumptions[i]) {
					if (j == "assumption") {
						try {
							await channel.send(`Assuming ${result.queryresult.assumptions[i][j][0].$.word} is ${result.queryresult.assumptions[i][j][0].value[0].$.desc}`);
						} catch (e) {
							console.log("WolframAlpha: failed displaying assumption:\n" + e.stack());
						}
					}
				}
			}
		}
		for (let a = 0; a < result.queryresult.pod.length; a++) {
			let pod = result.queryresult.pod[a];
			const title = "**" + pod.$.title + "**:";
			let embeds = []
			for (let b = 0; b < pod.subpod.length; b++) {
				let subpod = pod.subpod[b];
				//can also display the plain text, but the images are prettier
				/*for(let c=0; c<subpod.plaintext.length; c++)
				{
					response += '\t'+subpod.plaintext[c];
				}*/
				for (let d = 0; d < subpod.img.length; d++) {
					let embed = new Discord.MessageEmbed();
					embed.title = title;
					if (subpod.$.title.length > 0) {
						embed.description = subpod.$.title;
					}
					embed.type = 'image';
					embed.image = { url: subpod.img[d].$.src };
					embed.color = 0xff9339;
					embed.provider = {
						name: "WolframAlpha",
						url: "https://www.wolframalpha.com/"
					};
					await channel.send("", embed);
				}
			}
			if (pod.hasOwnProperty("infos")) {
				let message = title;
				message += "\nAdditional Info:"
				for (infos of pod.infos) {
					for (info of infos.info) {
						if (info.hasOwnProperty('$') && info.$.hasOwnProperty("text")) {
							message += '\n' + info.$.text;
						}
						if (info.hasOwnProperty("link")) {
							for (link of info.link) {
								message += '\n' + `${link.$.title} ${link.$.text}: ${link.$.url}`;
							}
						}
						embeds = []
						if (info.hasOwnProperty("img")) {
							for (img of info.img) {
								let embed = new Discord.MessageEmbed();
								embed.description = img.$.title;
								embed.image = { url: img.$.src };
								embed.color = 0xffc230;
								embeds.push(embed);
							}
						}
					}
				}
				await channel.send(message, embeds);
			}
		}
	} else {
		if (result.queryresult.hasOwnProperty("didyoumeans")) {
			let msg = [];
			for (let i in result.queryresult.didyoumeans) {
				for (let j in result.queryresult.didyoumeans[i].didyoumean) {
					msg.push(result.queryresult.didyoumeans[i].didyoumean[j]._);
				}
			}
			(await tmpMsg).edit("Did you mean: " + msg.join(" "));
		} else {
			(await tmpMsg).edit("No results from Wolfram Alpha :(");
		}
	}
};

module.exports = WolframPlugin;
