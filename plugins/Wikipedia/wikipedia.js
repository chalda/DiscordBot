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

async function ShowPage(msg, page_title) {
	let page = await Wiki(options).page(page_title);
	const title = page_title;
	let image = page.mainImage();
	let summary = page.summary();
	let info = page.fullInfo();
	let embed = new Discord.MessageEmbed();
	embed.title = title;
	embed.color = 0xfefefe;
	embed.type = "article";
	embed.thumbnail = { url: "https://en.wikipedia.org/static/images/project-logos/enwiki.png" };
	embed.url = page.url();
	image = await image;
	if (image !== undefined) {
		embed.image = { url: image }
	}
	info = await info;
	for (prop in info.general) {
		if (prop == "name") continue;
		// Embedded image, but isn't a URL
		if (prop.includes("image")) {
			continue;
		}
		// Image caption
		if (prop == "caption") continue;
		embed.addField(toWords(prop), info.general[prop].toString(), true);
	}
	summary = await summary;
	if (summary.length > 2048) {
		await msg.channel.send("", embed);
		let sumText = summary.toString().split('\n');
		let continuation = function () {
			let paragraph = sumText.shift();
			if (paragraph) {
				msg.channel.send(paragraph).then(continuation);
			}
		};
		continuation();
	} else {
		embed.description = summary.toString();
		msg.channel.send("", embed);
	}
}

exports.wiki = {
	usage: "<search terms>",
	description: "Returns the summary of the first matching search result from Wikipedia, or a random page if no searh terms were specified.",
	process: async function (bot, msg, suffix) {
		try {
			let query = suffix;
			if (!query) {
				let results = await Wiki(options).random(1);
				console.log("Random wiki page is " + results[0]);
				// For some reason page() breaks when passed the title directly, so we search it as a workaround.
				let data = await Wiki(options).search(results[0], 1);
				await ShowPage(msg, data.results[0]);
				return;
			}

			let data = await Wiki(options).search(query, 1);
			if (data.results.length == 0) {
				await msg.channel.send("no results found for " + query);
			} else {
				await ShowPage(msg, data.results[0]);
			}
		} catch (err) {
			msg.channel.send("Couldn't talk to Wikipedia: " + err);
		}
	}
}
