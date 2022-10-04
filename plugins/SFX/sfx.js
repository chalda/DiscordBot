const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const fs = require('fs');
const MemoryStream = require('memorystream');
const axios = require('axios').default;
const VoiceManager = require('../../voice_manager');
const { eventNames } = require('process');

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
	var voiceChannelArray = msg.guild.channels.cache.filter((v)=>v.type == "GUILD_VOICE").filter((v)=>v.members.has(msg.author.id));
    console.log(JSON.stringify(voiceChannelArray));
	if(voiceChannelArray.length == 0) return null;
	else return voiceChannelArray.at(0);
}

exports.sfx = {
    usage: "<sound name>",
    description: "Play the sound effect with the given name in the voice channel the user is in",
    process: async (client, msg, suffix, isEdit) => {
        const guild_channel = VoiceManager.getUserVoiceChannel(msg);
        console.log(JSON.stringify(guild_channel));
        if (!guild_channel) return msg.channel.send('You\'re not in a voice channel.');

        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send('No name specified!');

        // Check if the name exists.
        const sfxdir = await fs.promises.opendir(SFX_LOCATION);
        for await (const dirent of sfxdir) {
            if(dirent.name === suffix) {
                console.log("Playing " + SFX_LOCATION+dirent.name);

                // HACK: We manually make a file stream and buffer here because otherwise
                // discord.js breaks and never plays sfx after the Youtube player has played
                let file_stream = fs.createReadStream(SFX_LOCATION+dirent.name);
                let MAXIMUM_SONG_BUFFER_SIZE = (options && options.maxSongBufferSize) || 1024 * 1024 * 1024;
                const buffer = new MemoryStream(null,{maxbufsize:MAXIMUM_SONG_BUFFER_SIZE});
                file_stream.pipe(buffer);
                file_stream.on('error',(error) => {
                    console.log(`sfx file error: ${error}`);
                })

                let events = VoiceManager.queue(guild_channel,DiscordVoice.createAudioResource(buffer),{content: suffix});
                const response = msg.channel.send(`will play ${dirent.name}`);
                events.on('playing', async () => {
                    console.log(`Start playing ${dirent.name} in ${guild_channel.name}`);
                    (await response).edit(`playing ${dirent.name}`);
                });
                events.on('done', async () => {
                    console.log("Done playing " + dirent.name);
                    (await response).delete();
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
