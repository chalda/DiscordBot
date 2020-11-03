exports.commands = [
	"wiki"
]

const Wiki = require('wikijs').default;
const Discord = require('discord.js');
const toWords = require('split-camelcase-to-words');

const options = {
	headers: {
		'User-Agent': 'DiscordBot (https://github.com/chalda/DiscordBot) wiki.js'
	}
};

function ShowPage(msg,page_title){
	return Wiki(options).page(page_title).then(function(page) {
		const title = page_title;
		page.mainImage().then((image)=>{
			page.summary().then((summary) => {
				page.fullInfo().then((info)=>{
					var embed = new Discord.MessageEmbed();
					embed.title = title;
					embed.color = 0xfefefe;
					embed.type = "article";
					embed.thumbnail = {url:"https://en.wikipedia.org/static/images/project-logos/enwiki.png"};
					embed.url = page.url();
					if(image !== undefined){
						embed.image = {url:image}
					}
					for(prop in info.general){
						if(prop == "name") continue;
						// Embedded image, but isn't a URL
						if(prop.includes("image")) {
							continue;
						}
						// Image caption
						if(prop == "caption") continue;
						embed.addField(toWords(prop),info.general[prop].toString(),true);
					}
					if(summary.length > 2048){
						msg.channel.send("",embed).then(()=>{
							var sumText = summary.toString().split('\n');
							var continuation = function() {
								var paragraph = sumText.shift();
								if(paragraph){
									msg.channel.send(paragraph).then(continuation);
								}
							};
							continuation();
						});
					} else {
						embed.description = summary.toString();
						msg.channel.send("",embed);
					}
				});
			});
		});
	});
}

exports.wiki = {
	usage: "<search terms>",
	description: "Returns the summary of the first matching search result from Wikipedia, or a random page if no searh terms were specified.",
	process: function(bot,msg,suffix) {
		var query = suffix;
		if(!query) {
			Wiki(options).random(1).then((results)=>{
				console.log("Random wiki page is " + results[0]);
				// For some reason page() breaks when passed the title directly, so we search it as a workaround.
				Wiki(options).search(results[0],1).then(function(data) {
					ShowPage(msg,data.results[0]);
				});
			});
			return;
		}
		
		Wiki(options).search(query,1).then(function(data) {
			if(data.results.length == 0){
				msg.channel.send("no results found for " + query);
			} else {
				ShowPage(msg,data.results[0]);
			}
		},function(err){
			msg.channel.send(err);
		});
	}
}
