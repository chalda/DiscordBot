const YoutubeDL = require('youtube-dl');
const Discord = require('discord.js');
const MemoryStream = require('memorystream');

let options = false;
const MUSIC_CHANNEL_NAME = (options && options.musicChannelName) || 'music';
let GLOBAL_QUEUE = (options && options.global) || false;
let MAX_QUEUE_SIZE = (options && options.maxQueueSize) || 20;
let DEBUG = false;
let MAXIMUM_SONG_BUFFER_SIZE = (options && options.maxSongBufferSize) || 1024 * 1024 * 1024;
let SONG_BUFFER_TIME = (options && options.songBufferTimeMS) || 1000;

exports.commands = [
    "play",
    "skip",
    "queue",
    "dequeue",
    "pause",
    "resume"
]

function getResultTitle(result){
	let title = '';
	if(result.title && result.title !== '_') return result.title;
	if(result.track) title+= result.track;
	if(result.artist) title+= ' by ' + result.artist;
	return title;
}

function generateResultEmbed(title,result, queuer){		
	return new Discord.MessageEmbed()
		// Set the title of the field
		.setTitle(title)
		// Set the color of the embed
		.setColor(0xFF0000)
		// Set the main content of the embed
		.setDescription(getResultTitle(result))
		.setThumbnail(result.thumbnail)
		.addField('Duration:', result.duration, true)
		.addField('Queued By:', `${queuer}`, true);
    // Send the embed to the same channel as the message
}

function isUrl(str) {
    try {
        const the_url = new URL(str);
        return true;
    } catch(e) {
        return false;
    }
}

function getUserVoiceChannel(msg) {
	var voiceChannelArray = msg.guild.channels.cache.filter((v)=>v.type == "voice").filter((v)=>v.members.has(msg.author.id)).array();
	if(voiceChannelArray.length == 0) return null;
	else return voiceChannelArray[0];
}

  /*
 * Wrap text in a code block and escape grave characters.,
 *
 * @param text The input text.
 *
 * @return The wrapped text.
 */
function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}

class Player {
    constructor() {
        this.queue = [];
        this.playing = false;
        this.paused = false;
    }
    enqueue(client,msg,response,info) {
        this.queue.push({
            queuer: msg.author,
            response: response,
            info: info
        });
        if(this.voiceChannel === undefined){
            this.voiceChannel = getUserVoiceChannel(msg);
        }
        this.play_queue();
    }
    skip(){
        if(this.dispatcher){
            this.dispatcher.pause();
            return true;
        } else {
            return false;
        }
    }
    play_queue(){
        if(this.playing || this.queue.length === 0){
            //already playing
            return;
        }
        this.playing = true;
        this.voiceChannel.join().then(connection=>{
            this.connection = connection;
            if(DEBUG){
                connection.on('debug',console.log);
            }
            connection.on('warn',console.log);
            connection.on('error',console.log);
            this.play_song(connection);
        }).catch(err=>{
            console.error("Couldn't join the voice channel :(");
            console.log(err);
        })
    }
    play_song(connection){
        const video_info = this.queue[0].info;
        
        const stream = YoutubeDL(video_info,['-f', 'bestaudio[acodec=opus]/bestaudio/bestvideo']);
        const buffer = new MemoryStream(null,{maxbufsize:MAXIMUM_SONG_BUFFER_SIZE});
        stream.pipe(buffer);
        stream.on('error',(error)=>{
            console.log("YoutubeDL Stream error: " + error);
        })
        stream.on('close',()=>{
            console.log("YoutubeDL stream close");
        })
        
        stream.on('info', (info)=>{
            console.log('Download started')
            console.log('filename: ' + info._filename)
            console.log('size: ' + info.size)
            //const buffer = Buffer.allocUnsafe(info.size);
            //console.log(buffer)
        })
        
        stream.on('end',() => {
            console.log("YoutubeDL Stream end");
        })
        setTimeout(()=>{
            if(this.queue[0].response.channel){
                const embed = generateResultEmbed('Now Playing',video_info,this.queue[0].queuer);
                this.queue[0].response.channel.send('',embed);
                this.queue[0].response.delete();
            }
        const dispatcher = connection.play(buffer,{bitrate:'auto',volume:true});
        this.stream = stream;
        this.dispatcher = dispatcher;
        if(DEBUG){
            dispatcher.on('debug',console.log);
        }
        dispatcher.on('start',()=>{
            console.log('Playback start');
        });
        dispatcher.on('speaking',(speaking)=>{
            if(!speaking && !this.paused){
                console.log("Bot stopped speaking");
                this.queue.shift();
                if(this.queue.length === 0){
                    this.stop_playing(connection);
                } else {
                    const video = this.queue[0].info;
                    this.play_song(connection,video);
                }
            }
        });
        dispatcher.on('end',()=>{
            console.log("Dispatcher song end");
            this.queue.shift();
            if(this.queue.length === 0){
                this.stop_playing(connection);
            } else {
                const video = this.queue[0].info;
                this.play_song(connection,video);
            }
        });
    },SONG_BUFFER_TIME);
    }
    stop_playing(connection){
        connection.disconnect();
        this.playing = false;
        this.voiceChannel = undefined;
        this.stream = undefined;
        this.dispatcher = undefined;
    }
    pause(){
        this.paused = true;
        this.dispatcher.pause();
    }
    resume(){
        this.paused = false;
        this.dispatcher.resume();
    }
}

// Create an map of servers to players.
let players = {};

/*
 * Gets a queue.
 *
 * @param server The server id.
 */
function getPlayer(server) {
    // Check if global queues are enabled.
    if (GLOBAL_QUEUE) server = '_'; // Change to global queue.

    // Return the queue.
    if (!players[server]) players[server] = new Player();
    return players[server];
}

exports.play = {
    usage: "<search terms|URL>",
    description: "Plays the given video in the user's voice channel. Supports YouTube and many others: http://rg3.github.io/youtube-dl/supportedsites.html",
    process: function(client, msg, suffix, isEdit){
        if(isEdit) return;
        var arr = msg.guild.channels.cache.filter((v)=>v.type == "voice").filter((v)=>v.members.has(msg.author.id));
        let responseChannel = msg.guild.channels.cache.find((v)=>v.type == "text" && v.name === MUSIC_CHANNEL_NAME) || msg.channel;
        if (arr.length == 0) return msg.channel.send( wrap('You\'re not in a voice channel.'));

        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send( wrap('No video specified!'));
        
        // Get the player for this guild.
        let player = getPlayer(msg.guild.id);
        player.responseChannel = responseChannel;

		// Check if the queue has reached its maximum size.
		if (player.queue.length >= MAX_QUEUE_SIZE) {
			return msg.channel.send( wrap('Maximum queue size reached!'));
        }
        
        let msgtxt = 'Loading...'

        if(!isUrl(suffix)) {
            suffix = 'ytsearch1:' + suffix;
            msgtxt = 'Searching...'
        }

        responseChannel.send(msgtxt).then(response => {
            const video = YoutubeDL.getInfo(suffix, ['-i','--max-downloads', '1', '--no-playlist', '--no-check-certificate'], (err,info) =>{
                if(err){
                    console.log(err);
                    response.edit('Invalid Video!!');
                } else {
                    const embed = generateResultEmbed('Queued: '+player.queue.length,info,msg.author);
                    response.edit('',embed);
                    player.enqueue(client,msg,response,info);
                }
            });
        })
    }
}

exports.skip = {
    description: "skips to the next song in the playback queue",
    process: function(client, msg, suffix){
        let player = getPlayer(msg.guild.id);
        if(!player.skip()){
            msg.channel.send("Couldn't skip :(");
        }
    }
}

exports.queue = {
    description: "prints the current music queue for this server",
	process: function(client, msg, suffix) {
        let player = getPlayer(msg.guild.id);
        const length = player.queue.length;
        var count = 0;
        let msg_maker = (msg)=>{
            if(count == length) return;
            const song = player.queue[count];
            const title = count == 0 ? 'Now Playing:' : `${count}:`;
            count += 1;
            msg.channel.send('',generateResultEmbed(title,song.info,song.queuer)).then(msg_maker);
        }
        msg_maker(msg);
    }
}

exports.dequeue = {
    description: "Dequeues the given song index from the song queue.  Use the queue command to get the list of songs in the queue.",
    process: function(client, msg, suffix) {
        let player = getPlayer(msg.guild.id);
        if(!suffix){
            return msg.channel.send('You need to specify an index to remove from the queue.');
        }
        // Get the arguments
		var split = suffix.split(/(\s+)/);

        var index = parseInt(split[0]);

		// Make sure there's only 1 index 
		if (split.length > 1) {
            return msg.channel.send('There are too many arguments. Specify one song to remove.');
        } else if (isNaN(index)) {
            return msg.channel.send('Not a number!');
        }
        if (index >= 0 && index < player.queue.length) {
            const songRemoved = player.queue[index].info.title;
            if (index == 0) {
                player.skip();
            } else {
                player.queue.splice(index, 1);
            }
            msg.channel.send(`Removed ${songRemoved} (index ${index}) from the queue.`);
        }
    }
}

/*
    * Pause command.
    *
    * @param msg Original message.
    * @param suffix Command suffix.
    */
exports.pause = {
    description: "pauses music playback",
    process: function(client, msg, suffix) {
        let player = getPlayer(msg.guild.id);
        if (!player.playing) return msg.channel.send( wrap('No music being played.'));
        // Pause.
        msg.channel.send( wrap('Playback paused.'));
        player.pause();
    }
}

    /*
        * Resume command.
        *
        * @param msg Original message.
        * @param suffix Command suffix.
        */
exports.resume = {
    description: "resumes music playback",
    process: function(client, msg, suffix) {
        let player = getPlayer(msg.guild.id);
        if (!player.playing) return msg.channel.send( wrap('No music being played.'));

        // Resume.
        msg.channel.send( wrap('Playback resumed.'));
        player.resume();
    }
}
