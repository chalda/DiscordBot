var Discord = require("discord.js");
var Wolfram = require('node-wolfram');
var AuthDetails = require("../../auth.json");

function WolframPlugin () {
	this.wolfram = new Wolfram(AuthDetails.wolfram_api_key)
};

WolframPlugin.prototype.respond = function (query, channel, bot,tmpMsg) {
	this.wolfram.query(query, function(error, result) {
			if (error) {
				console.log(error);
				tmpMsg.edit("Couldn't talk to Wolfram Alpha :(")
			} else {
				console.log(JSON.stringify(result));
				if(result.queryresult.$.success == "true"){
					tmpMsg.delete();
					if(result.queryresult.hasOwnProperty("warnings")){
						for(var i in result.queryresult.warnings){
							for(var j in result.queryresult.warnings[i]){
								if(j != "$"){
									try {
										channel.send(result.queryresult.warnings[i][j][0].$.text);
									} catch(e){
										console.log("WolframAlpha: failed displaying warning:\n"+e.stack());
									}
								}
							}
						}
					}
					if(result.queryresult.hasOwnProperty("assumptions")){
						for(var i in result.queryresult.assumptions){
							for(var j in result.queryresult.assumptions[i]){
								if(j == "assumption"){
									try {
										channel.send(`Assuming ${result.queryresult.assumptions[i][j][0].$.word} is ${result.queryresult.assumptions[i][j][0].value[0].$.desc}`);
									} catch(e) {
										console.log("WolframAlpha: failed displaying assumption:\n"+e.stack());
									}
								}
							}
						}
					}
					for(var a=0; a<result.queryresult.pod.length; a++)
					{
						var pod = result.queryresult.pod[a];
						const title = "**"+pod.$.title+"**:";
						var embeds = []
						for(var b=0; b<pod.subpod.length; b++)
						{
							var subpod = pod.subpod[b];
											//can also display the plain text, but the images are prettier
							/*for(var c=0; c<subpod.plaintext.length; c++)
							{
								response += '\t'+subpod.plaintext[c];
							}*/
							for(var d=0; d<subpod.img.length;d++)
							{
								var embed = new Discord.MessageEmbed();
								embed.title = title;
								if(subpod.$.title.length > 0){
									embed.description = subpod.$.title;
								}
								embed.type = 'image';
								embed.image = {url: subpod.img[d].$.src};
								embed.color = 0xff9339;
								embed.provider = {
									name: "WolframAlpha",
									url: "https://www.wolframalpha.com/"
								};
								channel.send("",embed);
							}
						}
						if(pod.hasOwnProperty("infos")){
							var message = title;
							message += "\nAdditional Info:"
							for(infos of pod.infos){	
								for(info of infos.info){
									if(info.hasOwnProperty('$') && info.$.hasOwnProperty("text")){
										message += '\n' + info.$.text;
									}
									if(info.hasOwnProperty("link")){
										for(link of info.link){
											message += '\n' + `${link.$.title} ${link.$.text}: ${link.$.url}`;
										}
									}
									embeds = []
									if(info.hasOwnProperty("img")){
										for(img of info.img){
											var embed = new Discord.MessageEmbed();
											embed.description = img.$.title;
											embed.image = {url:img.$.src};
											embed.color = 0xffc230;
											embeds.push(embed);
										}						
									}	
								}
							}
							channel.send(message,embeds);
						}
					}
				} else {
					if(result.queryresult.hasOwnProperty("didyoumeans")){
						var msg = [];
						for(var i in result.queryresult.didyoumeans){
							for(var j in result.queryresult.didyoumeans[i].didyoumean) {
								msg.push(result.queryresult.didyoumeans[i].didyoumean[j]._);
							}
						}
						tmpMsg.edit("Did you mean: " + msg.join(" "));
					} else {
						tmpMsg.edit("No results from Wolfram Alpha :(");
					}
				}
			}
		});
};

module.exports = WolframPlugin;
