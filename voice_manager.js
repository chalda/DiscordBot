const DiscordVoice = require('@discordjs/voice');
const EventEmitter = require('events');

async function createPlayer(guild_channel) {
    const connection = DiscordVoice.joinVoiceChannel({
        channelId: guild_channel.id,
        guildId: guild_channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    const player = DiscordVoice.createAudioPlayer();
    await DiscordVoice.entersState(connection, VoiceConnectionStatus.Ready, 5_000);

}

playback_managers = {};

function make_on_finished(connection,player,events,manager) {
    return () => {
        events.emit('done');
        const next = manager.queue.shift();
        if (next === undefined) {
            connection.destroy();
            delete playback_managers[manager.guild_id];
        } else {
            player.once('playing', () => {
                next.events.emit('playing', player);
                player.once('idle', make_on_finished(connection,player,next.events,manager));
            });
            player.play(next.resource);
            manager.playing = next.resource;
            manager.events = next.events;
        }
    };
}

exports.queue = function (guild_channel, resource) {
    if (playback_managers.hasOwnProperty(guild_channel.guild.id)) {
        console.log("already playing in guild_channel.guild.id");
        const manager = playback_managers[guild_channel.guild.id];
        const events = new EventEmitter();
        manager.queue.push({
            resource: resource,
            events: events
        });
        return events;
    } else {
        // Nothing already playing for this guild
        const connection = DiscordVoice.joinVoiceChannel({
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
        player.play(resource);
        const events = new EventEmitter();
        const manager = {
            guild_id: guild_channel.guild.id,
            player: player,
            playing: resource,
            events: events,
            queue: []
        };
        playback_managers[guild_channel.guild.id] = manager;
        connection.once('ready', () => {
            connection.subscribe(player);
            player.once('playing', () => {
                events.emit('playing', player);
                player.once('idle', make_on_finished(connection,player,events,manager));
            });
        });
        return events;
    }
}