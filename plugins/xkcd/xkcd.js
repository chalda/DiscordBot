let Discord = require("discord.js");
exports.commands = [
	"xkcd",
	"highnoon"
]

exports.xkcd = {
	usage: "[comic number]",
	description: "displays a given xkcd comic number (or the latest if nothing specified",
	process: function(bot,msg,suffix){
		var url = "http://xkcd.com/";
		if(suffix != "") url += suffix+"/";
		url += "info.0.json";
		require("request")(url,function(err,res,body){
			try{
				var comic = JSON.parse(body);
				let embed = new Discord.MessageEmbed();
				embed.color = 0xffffff;
				embed.url = `https://xkcd.com/${comic.num}/`;
				embed.title = comic.title;
				embed.type = 'image';
				embed.image = { url: comic.img };
				embed.description = comic.alt;
				msg.channel.send({embeds: [embed]});
			}catch(e){
				msg.channel.send(
					`Couldn't fetch an XKCD for ${suffix}\n${e}`);
			}
		});
	}
}

exports.highnoon = {
	process: (bot,msg,suffix) => {
		require("request")({
			uri:"http://imgs.xkcd.com/comics/now.png",
			followAllRedirects:true
		},(err, resp, body) => msg.channel.send(resp.request.uri.href))
	}
}
