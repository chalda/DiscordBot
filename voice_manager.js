const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const EventEmitter = require('events');

function log_state(manager) {
    console.log(`State for ${manager.guild_name}(${manager.guild_id}):\n\tstate: ${manager.state}\n\tconnection: ${manager.connection_state}\n\tplayer: ${manager.player_state}\n\tresource: ${manager.resource_state}\n\tqueue size: ${manager.queue.length}`);
}

function check_state(manager) {
    if (manager.state === 'playing' && manager.player_state === 'idle' && manager.resource_state !== 'playing') {
        console.log('completed playback');
        manager.state = 'finished_playback';
        manager.events.emit('done');
        play_next(manager);
    }
    if (manager.state === 'finished_playback' && manager.resource_state === 'closed') {
        if (manager.player_state === 'idle' || manager.player_state === 'buffering') {
            //console.log('STUCK DETECTION TRIGGERED, SKIPPING AUDIO');
            //manager.events.emit('error');
            //play_next(manager);
        }
    }
    if (manager.player_state === 'buffering') {
        if (manager.playing.playStream.readable) {
            console.log("Attempting to employ super hack!");
            manager.playing.playStream.emit('readable');
        }
    }
    if (manager.state !== 'playing' && manager.player_state === 'playing') {
        manager.events.emit('playing');
        manager.state = 'playing';
    }
}

function set_resource_callbacks(manager,resource) {
    resource.playStream.on('end', () => {
        console.log(`Playing resource in ${manager.guild_name}(${manager.guild_id}) ended`);
        manager.resource_state = 'ended';
        log_state(manager);
        check_state(manager);
    });
    resource.playStream.on('close', () => {
        console.log(`Playing resource in ${manager.guild_name}(${manager.guild_id}) closed`);
        manager.resource_state = 'closed';
        log_state(manager);
        check_state(manager);
    });
    resource.playStream.on('error', (error) => {
        console.log(`Playing resource in ${manager.guild_name}(${manager.guild_id}) had an error: ${error}`);
        manager.resource_state = 'error';
        log_state(manager);
        check_state(manager);
    });
}

function register_player_callbacks(manager,player) {
    player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player for ${manager.guild_name}(${manager.guild_id}) transitioned from ${oldState.status} to ${newState.status}`);
        if (manager.player_state !== oldState.status) {
            console.log(`We thought it was in ${manager.player_state} instead!`);
        }
        manager.player_state = newState.status;
        log_state(manager);
        check_state(manager);
    });
}

function play_next(manager) {
    const next = manager.queue.shift();
    if (next === undefined) {
        console.log(`nothing queued, leaving voice in ${manager.guild_name}(${manager.guild_id})`);
        manager.state = 'closing';
        const connection = DiscordVoice.getVoiceConnection(manager.guild_id);
        connection.destroy();
        delete playback_managers[manager.guild_id];
    } else {
        console.log(`starting playback of next item in queue in ${manager.guild_name}(${manager.guild_id})`);
        manager.playing = next.resource;
        manager.events = next.events;
        set_resource_callbacks(manager,next.resource);
        manager.player = DiscordVoice.createAudioPlayer();
        register_player_callbacks(manager,manager.player);
        manager.player.play(next.resource);
        const connection = DiscordVoice.getVoiceConnection(manager.guild_id);
        if (connection) {
            connection.subscribe(manager.player);
        } else {
            console.log(`!!COULDN'T get voice connection, killing voice player for ${manager.guild_name}(${manager.guild_id})`);
            delete playback_managers[manager.guild_id];
        }
    }
}

function make_playback_manager(guild, connection, player, resource) {
    const manager = {
        guild_id: guild.id,
        guild_name: guild.name,
        player: player,
        playing: resource,
        events: new EventEmitter(),
        queue: [],
        loop: false,
        state: 'starting',
        connection_state: 'signalling',
        player_state: 'buffering',
        resource_state: 'playing',
    };
    
    set_resource_callbacks(manager,resource);
    connection.on('stateChange', (oldState, newState) => {
        console.log(`Connection for ${guild.name}(${guild.id}) transitioned from ${oldState.status} to ${newState.status}`);
        if (manager.connection_state !== oldState.status) {
            console.log(`Connection for ${guild.name}(${guild.id}) was in state ${oldState} but we thought it was in ${manager.connection_state}`)
        }
        manager.connection_state = newState.status;
        log_state(manager);
        if (manager.state === 'starting' && manager.connection_state === 'ready') {
            console.log(`starting playback in ${guild.name}(${guild.id})`);
            manager.state = 'playing';
            //connection.subscribe(player);
        }
    });
    register_player_callbacks(manager,player);
    
    return manager;
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

exports.getUserVoiceChannel = (msg) => {
    var voiceChannelArray = msg.guild.channels.cache.filter((v)=>v.type == "GUILD_VOICE").filter((v)=>v.members.has(msg.author.id));
    console.log(JSON.stringify(voiceChannelArray));
	if(voiceChannelArray.length == 0) return null;
	else return voiceChannelArray.at(0);
}

exports.queue = (guild_channel, resource, description) => {
    resource.playStream.on('error', () => {
        console.log('resource error');
    });
    resource.playStream.on('end', () => {
        console.log('resource end');
    });
    resource.playStream.on('pause', () => {
        console.log('resource pause');
    });
    resource.playStream.on('resume', () => {
        console.log('resource resume');
    });
    if (playback_managers.hasOwnProperty(guild_channel.guild.id)) {
        console.log(`already playing in ${guild_channel.guild.name}(${guild_channel.guild.id})`);
        const manager = playback_managers[guild_channel.guild.id];
        const events = new EventEmitter();
        manager.queue.push({
            resource: resource,
            events: events,
            description: description,
        });
        return events;
    } else {
        // Nothing already playing for this guild
        const connection = DiscordVoice.joinVoiceChannel({
            channelId: guild_channel.id,
            guildId: guild_channel.guild.id,
            adapterCreator: guild_channel.guild.voiceAdapterCreator,
        });

        // Set up a new audio player
        const player = DiscordVoice.createAudioPlayer();
        player.on('stateChange', (oldState, newState) => {
            console.log(`Audio player for ${guild_channel.guild.name}(${guild_channel.guild.id}) transitioned from ${oldState.status} to ${newState.status}`);
        });
        player.play(resource);
        // Make a playback manager to manage playback in this channel
        const manager = make_playback_manager(guild_channel.guild, connection, player, resource);
        manager.description = description;
        const events = manager.events;
        playback_managers[guild_channel.guild.id] = manager;
        // Start playback as soon as the connection is ready
        connection.once('ready', () => {
            connection.subscribe(player);
        });
        return events;
    }
}

exports.skip = (guild_id) => {
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        manager.player.stop(true);
        return true;
    }
    return false;
}

exports.pause = (guild_id) => {
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        return manager.player.pause();
    }
    return false;
}

exports.unpause = (guild_id) => {
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        return manager.player.unpause();
    }
    return false;
}

exports.stop_playback = (guild_id) => {
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        manager.queue.length = 0;
        manager.player.stop(true);
        return true;
    }
    return false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

exports.shuffle = (guild_id) => {
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        shuffleArray(manager.queue);
        return true;
    }
    return false;
}

exports.loop = (guild_id) => {
    throw 'Not implemented!';
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        manager.loop = !manager.loop;
        return manager.loop;
    }
    return 'error';
}

exports.dequeue = (guild_id, index) => {
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        if ( index >=0 && index < manager.queue.length) {
            manager.queue.splice(index, 1);
            return true;
        }
    }
    return false;
}

exports.show_queue = async (msg, compact) => {
    const guild_id = msg.guild.id;
    if (playback_managers.hasOwnProperty(guild_id)) {
        const manager = playback_managers[guild_id];
        if (manager.queue.length > 9) {
            compact = true;
        }
        if(compact) {
            let list = manager.queue.map((entry) => {
                if (entry.hasOwnProperty('description')) {
                    if (entry.description.hasOwnProperty('content')) {
                        return entry.description.content;
                    }
                }
                return '<unknown>';
            });
            let playing = '<unknown>';
            if (manager.hasOwnProperty('description')) {
                if (manager.description.hasOwnProperty('content')) {
                    playing = manager.description.content;
                }
            }
            let response = `Now Playing: ${playing}\n`;
            let index = 0;
            while (list.length > 0) {
                let entry = `${index}: ${list.shift()}\n`;
                index += 1;
                let newmsg = `${response}${entry}`;
                if(newmsg.length > (1024 - 8)){
                    await msg.channel.send(response);
                    response = entry;
                } else {
                    response = newmsg;
                }
            }
            msg.channel.send(response);
        } else {
            //Assume we can stuff all the embeds into one message
            let list = manager.queue.map((entry) => {
                if (entry.hasOwnProperty('description')) {
                    if (entry.description.hasOwnProperty('embed')) {
                        return entry.description.embed;
                    } else if (entry.description.hasOwnProperty('content')) {
                        return new Discord.MessageEmbed().setTitle(`Queued: ${entry.description.content}`);
                    }
                }
                return new Discord.MessageEmbed().setTitle('<unknown>');
            });
            let playing = new Discord.MessageEmbed().setTitle('Queued: <unknown>');
            if (manager.hasOwnProperty('description')) {
                if (manager.description.hasOwnProperty('embed')) {
                    playing = manager.description.embed;
                } else if (manager.description.hasOwnProperty('content')) {
                    playing = new Discord.MessageEmbed().setTitle(`Queued: ${manager.description.content}`);
                }
            }
            playing.title.replace('Queued','Now Playing');
            let embeds = [playing];
            embeds = embeds.concat(list);
            await msg.channel.send({embeds: embeds});
        }
        return true;
    }
    return false;
}

exports.EventWaiter = (events) => {
    return {
        playing: () => {
            return new Promise((resolve, reject) => {
                events.once('playing',() => {
                    resolve();
                });
            });
        },
        done: () => {
            return new Promise((resolve, reject) => {
                events.once('done', () => {
                    resolve();
                });
            });
        }
    }
}