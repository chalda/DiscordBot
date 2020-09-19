const Discord = require('discord.js');
const fs = require('fs');
const axios = require('axios').default;

exports.commands = [
    "sfxadd",
    "sfxrm",
    "sfx",
    "sfxlist"
]

let options = false;
SFX_LOCATION = (options && options.sfxLocation) || 'sfx_files/';

exports.sfxadd = {
    usage: "<sound name>",
    description: "Uploads the sound effect attached to the message for use with the sfx command",
    process: async (client, msg, suffix, isEdit) => {
        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send('No name specified!');

        // Check if the name is already taken
        const sfxdir = await fs.promises.opendir(SFX_LOCATION);
        for await (const dirent of sfxdir) {
            if(dirent.name === suffix) {
                return msg.channel.send('Name is already taken!');
            }
        }

        if(msg.attachments.length == 0){
            return msg.channel.send('No file attached!');
        }
        for ( const attachment of msg.attachments){
            try {
                console.log("Downloading " + attachment[1].url);
                const response = await axios.get(attachment[1].url,{responseType: 'arraybuffer'});
                await fs.promises.writeFile(SFX_LOCATION+suffix,response.data);
                msg.channel.send("Added " + suffix);
            } catch (error) {
                console.log(error);
                msg.channel.send("Couldn't download the attachment :(");
            }
        }
    }
}

exports.sfxrm = {
    usage: "<sound name>",
    description: "Removes the given sound effect",
    process: async (client, msg, suffix, isEdit) => {
        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send('No name specified!');

        const sfxdir = await fs.promises.opendir(SFX_LOCATION);
        for await (const dirent of sfxdir) {
            if(dirent.name === suffix) {
                await fs.promises.unlink(SFX_LOCATION + dirent.name);
                return msg.channel.send(dirent.name + ' Deleted');
            }
        }
    }
}

function getUserVoiceChannel(msg) {
	var voiceChannelArray = msg.guild.channels.cache.filter((v)=>v.type == "voice").filter((v)=>v.members.has(msg.author.id)).array();
	if(voiceChannelArray.length == 0) return null;
	else return voiceChannelArray[0];
}

exports.sfx = {
    usage: "<sound name>",
    description: "Play the sound effect with the given name in the voice channel the user is in",
    process: async (client, msg, suffix, isEdit) => {
        const channel = getUserVoiceChannel(msg);
        if (!channel) return msg.channel.send('You\'re not in a voice channel.');

        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send('No name specified!');

        // Check if the name exists.
        const sfxdir = await fs.promises.opendir(SFX_LOCATION);
        for await (const dirent of sfxdir) {
            if(dirent.name === suffix) {
                console.log("Playing " + SFX_LOCATION+dirent.name);
                const connection = await channel.join();
                connection.on('warn',console.log);
                connection.on('error',console.log);
                const dispatcher = connection.play(SFX_LOCATION+dirent.name);
                dispatcher.on('debug',console.log);
                
                dispatcher.on('start',()=>{
                    console.log('Playback start');
                });
                dispatcher.on('speaking',(speaking)=>{
                    if(!speaking){
                        connection.disconnect();
                    }
                });
                dispatcher.on('end',()=>{
                    connection.disconnect();
                });
            }
        }
    }
}

exports.sfxlist = {
    usage: "",
    description: "Lists all available sound effects",
    process: async (client, msg, suffix, isEdit) => {
        const sfxdir = await fs.promises.opendir(SFX_LOCATION);
        var resp = "**Available Sounds:**\n";
        for await (const dirent of sfxdir) {
            resp += dirent.name + '\n'
        }
        await msg.channel.send(resp);
    }
}
