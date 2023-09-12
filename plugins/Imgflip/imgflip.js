exports.commands = [
	"meme"
]

var AuthDetails = require("../../auth.js").getAuthDetails();
const { SlashCommandBuilder } = require("@discordjs/builders");
var Config = require("../../config.json");
const axios = require('axios').default;

//https://api.imgflip.com/popular_meme_ids
var classic_memes = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716,
	"awkwardpenguin": 61584
};

var hot_memes = {};

exports.meme = {
	usage: 'meme "top text" "bottom text"',
			description: function() {
		var str = "Currently available memes:\n"
		for (var m in classic_memes){
			str += "\t\t" + m + "\n"
		}
		return str;
	},
	process: function(bot,msg,suffix) {
		var tags = msg.content.split('"');
		var memetype = tags[0].split(" ")[1];
		//msg.channel.send(tags);
		var Imgflipper = require("imgflipper");
		var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
		imgflipper.generateMeme(classic_memes[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
			console.log(arguments);
			console.log(image);
			if(image){
			msg.channel.send(image);
		}
		else  {
			msg.channel.send(Config.commandPrefix + "meme <Template> <first text> <last text>");
	}
		});
	},
	makeSlashCommand: async () => {
		//console.log("fetching memes");
		const result = await axios.get('https://api.imgflip.com/get_memes');
		if (result.data.success) {
			//console.log("got memes");
			let new_memes = {};
			for(new_meme of result.data.data.memes){
				new_memes[new_meme.name] = new_meme.id;
			}
			hot_memes = new_memes;
		} else {
			console.log(`couldn't get memes: ${result.data}\n${result.data}`);
		}
		const command = new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Generates memes')
		/*.addSubcommand(subcommand => subcommand
			.setName('hot')
			.setDescription('hot memes')*/
			.addStringOption(option => option
				.setName('meme')
				.setDescription('the meme template to use')
				.setRequired(true)
				.addChoices(
					...Object.keys(hot_memes).slice(0,24).map(value => { return { name: value, value: value}})
				)
			)
			.addStringOption(option => option
				.setName('top_text')
				.setDescription('top text'))
			.addStringOption(option => option
				.setName('bottom_text')
				.setDescription('bottom text'))//)*/
		/*.addSubcommand(subcommand => subcommand
			.setName('classic')
			.setDescription('classic memes'))
			/*.addStringOption(option => option
				.setName('meme')
				.setDescription('the meme template to use')
				.setRequired(true)
				.addChoices(
					...Object.keys(classic_memes).map(value => { return { name: value, value: value}})
				)
			)
			.addStringOption(option => option
				.setName('top_text')
				.setDescription('top text'))
			.addStringOption(option => option
				.setName('bottom_text')
				.setDescription('bottom text')))
		.addSubcommand(subcommand => subcommand
			.setName('custom')
			.setDescription('use a custom imgflip template id')
			.addIntegerOption(option => option
				.setName('template_id')
				.setDescription('use https://imgflip.com/memesearch to find meme ids'))
			.addStringOption(option => option
				.setName('top_text')
				.setDescription('top text'))
			.addStringOption(option => option
				.setName('bottom_text')
				.setDescription('bottom text')))*/
		//console.log(JSON.stringify(command));
		return command;
		
	},
	slashCommand: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Generates memes')
		.addStringOption(option => option
			.setName('meme')
			.setDescription('the meme template to use')
			.setRequired(true)
			.addChoices(
				...Object.keys(classic_memes).map(value => { return { name: value, value: value}})
			)
		)
		.addStringOption(option => option
			.setName('top_text')
			.setDescription('top text'))
		.addStringOption(option => option
			.setName('bottom_text')
			.setDescription('bottom text')),
	slashCommandExec: async interaction => {
		const memename = interaction.options.getString('meme');
		let top_text = interaction.options.getString('top_text');
		top_text = top_text?top_text:"";
		let bottom_text = interaction.options.getString('bottom_text');
		bottom_text = bottom_text?bottom_text:"";
		const Imgflipper = require("imgflipper");
		const imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
		imgflipper.generateMeme(hot_memes[memename], top_text, bottom_text, (err, image) => {
			console.log(arguments);
			console.log(image);
			if(image){
				interaction.reply(image);
			} else {
				console.log(err);
				interaction.reply(`Error: ${err}`);
			}
		})

	}
}
