var fs = require('fs')

exports.commands = [
	"memes",
    "addmeme",
    "imgmeme"
]

var MemeChannels = {};
try{
	MemeChannels = require("../../meme_channels.json");
} catch(e){
	//no meme channels registered
}

var Memes = {
    textMemes: {},
    imgMemes: {}
};
try{
	Memes = require("../../memes.json");
} catch(e){
	//no memes registered
}

function saveMemeChannels(){
    fs.writeFile("./meme_channels.json",JSON.stringify(MemeChannels,null,2),(err) => {
        if(err) {
            console.error(err)
        }
    });
}

function saveMemes(){
    fs.writeFile("./memes.json",JSON.stringify(Memes,null,2),(err) => {
        if(err) {
            console.error(err)
        }
    });
}

exports.init = (hooks) => {
    hooks.onMessage.push((msg) => {
        if(MemeChannels[msg.channel] == "on"){
            for(meme in Memes.textMemes){
                if(msg.toString().includes(meme)){
                    msg.channel.send(Memes.textMemes[meme])
                }
            }
            for(meme in Memes.imgMemes){
                if(msg.toString().includes(meme)){
                    msg.channel.send("",{embed:{
                        "image": {
                            url: Memes.imgMemes[meme]
                        }
                    }});
                }
            }
        }
    })
}

exports.memes = {
    usage: "<on|off>",
    description: "turns the memes on or off for this channel",
    process: function(bot,msg,suffix){
        if(suffix.includes("off")){
            delete MemeChannels[msg.channel];
            saveMemeChannels();
        } else if(suffix.includes("on")){
            MemeChannels[msg.channel] = "on";
            saveMemeChannels();
            msg.channel.send("Memes enabled :)");
        } else {
            msg.channel.send("Unknown arguments: " + suffix);
        }
    }
}

exports.addmeme = {
    usage: '"meme" "response"',
    description: "creates a meme response when someone states the given message",
    process: function(bot,msg,suffix){
        var parsed = []
        try {
            parsed = suffix.split('"').map(str => str.trim()).filter(str => str.length > 0);
        } catch (e) {
            //handled by if below
        }
        if(parsed.length != 2) {
            msg.channel.send('Failed to parse meme, should be of the form "meme" "response"');
        } else {
            Memes.textMemes[parsed[0]] = parsed[1];
            saveMemes();
        }
    }
}

exports.imgmeme = {
    usage: '"meme" <image url>',
    description: "creates a meme response when someone states the given message",
    process: function(bot,msg,suffix){
        var parsed = []
        try {
            parsed = suffix.split('"').map(str => str.trim()).filter(str => str.length > 0);
        } catch (e) {
            //handled by if below
        }
        if(parsed.length != 2) {
            msg.channel.send('Failed to parse meme, should be of the form "meme" "response"');
        } else {
            Memes.imgMemes[parsed[0]] = parsed[1];
            saveMemes();
        }
    }
}