const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const fs = require('fs');
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
    return voiceChannelArray.at(0);
	if(voiceChannelArray.length == 0) return null;
	else return voiceChannelArray[0];
}

exports.sfx = {
    usage: "<sound name>",
    description: "Play the sound effect with the given name in the voice channel the user is in",
    process: async (client, msg, suffix, isEdit) => {
        const guild_channel = getUserVoiceChannel(msg);
        console.log(JSON.stringify(guild_channel));
        if (!guild_channel) return msg.channel.send('You\'re not in a voice channel.');

        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send('No name specified!');

        // Check if the name exists.
        const sfxdir = await fs.promises.opendir(SFX_LOCATION);
        for await (const dirent of sfxdir) {
            if(dirent.name === suffix) {
                console.log("Playing " + SFX_LOCATION+dirent.name);
                /*const connection = await channel.join();
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
                });*/
                /*const connection = DiscordVoice.joinVoiceChannel({
                    channelId: guild_channel.id,
                    guildId: guild_channel.guild.id,
                    adapterCreator: guild_channel.guild.voiceAdapterCreator,
                });
                connection.on('stateChange', (oldState, newState) => {
                    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
                });
                const player = DiscordVoice.createAudioPlayer();
                player.on('stateChange', (oldState, newState) => {
                    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
                });
                //await DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Ready, 5_000);
                player.play(DiscordVoice.createAudioResource(SFX_LOCATION+dirent.name));
                connection.subscribe(player);
                await DiscordVoice.entersState(player,DiscordVoice.AudioPlayerStatus.Playing);
                await DiscordVoice.entersState(player,DiscordVoice.AudioPlayerStatus.Idle);
                player.stop();
                connection.destroy();*/
                let events = VoiceManager.queue(guild_channel,DiscordVoice.createAudioResource(SFX_LOCATION+dirent.name));
                events.on('playing', () => {
                    console.log("Start playing " + dirent.name);
                });
                events.on('done', () => {
                    console.log("Done playing " + dirent.name);
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
