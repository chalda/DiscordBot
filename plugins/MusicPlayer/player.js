const YoutubeDL = require('youtube-dl');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const MemoryStream = require('memorystream');
const SpotifyWebApi = require('spotify-web-api-node');
const AuthDetails = require("../../auth.js").getAuthDetails();
const VoiceManager = require('../../voice_manager');

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
    "stop_playback",
    "queue",
    "dequeue",
    "pause",
    "resume",
    "playlist",
    "shuffle",
    // Need rewrite for the unified queue
    //"loop"
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
	try{
		if(voiceChannelArray.length != 0) return voiceChannelArray[0];
	} catch(e){
		user = msg.author.username;
		warn("User "+String.user+" tried to play music while not in a voice channel. "+e);
	}
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

/*function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

class Player {
    constructor() {
        this.queue = [];
        this.playing = false;
        this.paused = false;
        this.looping = false;
    }
    enqueue(client,msg,response,info) {
        this.voiceChannel = VoiceManager.getUserVoiceChannel(msg);
        this.queue.push({
            queuer: msg.author,
            response: response,
            info: info
        });
        //if(this.voiceChannel === undefined){
            
        //}
        this.play_queue(this.voiceChannel);
    }
    skip(){
        if(this.dispatcher){
            this.dispatcher.pause();
            return true;
        } else {
            return false;
        }
    }
    stop_playback(){
        this.queue = [];*/
        /*if(this.dispatcher){
            this.dispatcher.pause();
            return true;
        } else {
            return false;
        }*/
    /*}
    play_queue(voiceChannel){
        if(this.playing || this.queue.length === 0){
            //already playing
            return;
        }
        this.playing = true;
        this.play_song(voiceChannel);
        /*this.voiceChannel.join().then(connection=>{
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
        })*/
    /*}
    play_song(voiceChannel){
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
            if(this.queue[0].response){
                if(this.queue[0].response.channel){
                    const embed = generateResultEmbed('Now Playing',video_info,this.queue[0].queuer);
                    this.queue[0].response.channel.send({ embeds: [embed]});
                    this.queue[0].response.delete();
                }
            } else {
                let msg_channel = this.voiceChannel.guild.channels.cache.find((v)=>v.type == "text" && v.name === MUSIC_CHANNEL_NAME);
                if(msg_channel){
                    const embed = generateResultEmbed('Now Playing',video_info,this.queue[0].queuer);
                    msg_channel.send({ embeds: [embed]});
                }
            }
            console.log(`Queuing ${buffer.toString()} to ${voiceChannel.toString()}`);
            const events = VoiceManager.queue(voiceChannel,buffer);
            events.once('done', () => {
                if(this.queue.length >= 1 && this.looping){
                    let ended = this.queue.shift();
                    ended.response = null;
                    this.queue.push(ended);
                } else {
                    this.queue.shift();
                }
                if(this.queue.length === 0){
                    this.stop_playing(connection);
                } else {
                    const video = this.queue[0].info;
                    this.play_song();
                }
            });
            /*const dispatcher = connection.play(buffer,{bitrate:'auto',volume:true});
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
                    if(this.queue.length >= 1 && this.looping){
                        let ended = this.queue.shift();
                        ended.response = null;
                        this.queue.push(ended);
                    } else {
                        this.queue.shift();
                    }
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
                if(this.queue.length >= 1 && this.looping){
                    let ended = this.queue.shift();
                    ended.response = null;
                    this.queue.push(ended);
                } else {
                    this.queue.shift();
                }
                if(this.queue.length === 0){
                    this.stop_playing(connection);
                } else {
                    const video = this.queue[0].info;
                    this.play_song(connection,video);
                }
            });*//*
        },SONG_BUFFER_TIME);
    }
    stop_playing(){
        //connection.disconnect();
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
    loop(){
        this.looping = !this.looping;
    }
}*/

// Create an map of servers to players.
//let players = {};

/*
 * Gets a queue.
 *
 * @param server The server id.
 */
/*function getPlayer(server) {
    // Check if global queues are enabled.
    if (GLOBAL_QUEUE) server = '_'; // Change to global queue.

    // Return the queue.
    if (!players[server]) players[server] = new Player();
    return players[server];
}*/

function getUserVoiceChannel(msg) {
	var voiceChannelArray = msg.guild.channels.cache.filter((v)=>v.type == "GUILD_VOICE").filter((v)=>v.members.has(msg.author.id));
    console.log(JSON.stringify(voiceChannelArray));
	if(voiceChannelArray.length == 0) return null;
	else return voiceChannelArray.at(0);
}

function playYoutube(info,channel,author) {
    const stream = YoutubeDL(info,['-f', 'bestaudio[acodec=opus]/bestaudio/bestvideo']);
    const buffer = new MemoryStream(null,{maxbufsize:MAXIMUM_SONG_BUFFER_SIZE});
    stream.pipe(buffer);
    stream.on('error',(error)=>{
        console.log("YoutubeDL Stream error: " + error);
    });
    stream.on('close',()=>{
        console.log("YoutubeDL stream close");
    });
    
    stream.on('info', (info)=>{
        console.log('Download started')
        console.log('filename: ' + info._filename)
        console.log('size: ' + info.size)
    });
    
    stream.on('end',() => {
        console.log("YoutubeDL Stream end");
    });

    resource = DiscordVoice.createAudioResource(buffer);
    let description = {
        content: getResultTitle(info),
        embed: generateResultEmbed('Queued:',info,author)
    }
    return VoiceManager.queue(channel, resource, description);
}

exports.play = {
    usage: "<search terms|URL>",
    description: "Plays the given video in the user's voice channel. Supports YouTube and many others: http://rg3.github.io/youtube-dl/supportedsites.html",
    process: function(client, msg, suffix, isEdit){
        if(isEdit) return;
        var arr = msg.guild.channels.cache.filter((v)=>v.type == "GUILD_VOICE").filter((v)=>v.members.has(msg.author.id));
        let responseChannel = msg.guild.channels.cache.find((v)=>v.type == "text" && v.name === MUSIC_CHANNEL_NAME) || msg.channel;
        if (arr.length == 0) return msg.channel.send( wrap('You\'re not in a voice channel.'));

        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send( wrap('No video specified!'));
                
        let msgtxt = 'Loading...'

        if(!isUrl(suffix)) {
            suffix = 'ytsearch1:' + suffix;
            msgtxt = 'Searching...'
        }

        responseChannel.send(msgtxt).then(response => {
            const video = YoutubeDL.getInfo(suffix, ['-i','--max-downloads', '1', '--no-playlist', '--no-check-certificate'], async (err,info) =>{
                if(err){
                    console.log(err);
                    response.edit('Invalid Video!!');
                } else {
                    const embed = generateResultEmbed('Queued:',info,msg.author);
                    response = await response.edit({ content: ' ', embeds: [embed]});
                    const events = await playYoutube(info,getUserVoiceChannel(msg),msg.author);
                    const waiter = VoiceManager.EventWaiter(events);
                    await waiter.playing();
                    const embed2 = generateResultEmbed('Now Playing',info,msg.author);
                    await response.edit({ embeds: [embed2]});
                }
            });
        });
    }
}

exports.skip = {
    description: "skips to the next song in the playback queue",
    process: function(client, msg, suffix){
        if (!VoiceManager.skip(msg.guild.id)) {
            msg.channel.send("Couldn't skip :(");
        }
    }
}

exports.stop_playback = {
    description: "stops music playback",
    process: function(client, msg, suffix){
        if(!VoiceManager.skip(msg.guild.id)){
            msg.channel.send("Couldn't stop playback :( Were you playing anything?");
        }
    }
}

exports.queue = {
    usage: "[-s]",
    description: "prints the current music queue for this server. -s to always print in concise form",
	process: async function(client, msg, suffix) {
        if (!await VoiceManager.show_queue(msg,suffix.includes("-s"))) {
            msg.channel.send("Nothing queued.");
        }
        /*let player = getPlayer(msg.guild.id);
        const length = player.queue.length;
        var count = 0;
        // Always output long queues in concise form to avoid excessive spamming.
        if(suffix.includes("-s") || length > 5){
            let list = player.queue.map((song)=>{
                let entry = (count == 0 ? 'Now Playing: ' : `${count}: `) + getResultTitle(song.info) + '\n';
                count++;
                return entry;
            });
            let response = "";
            while(list.length > 0) {
                let entry = list.shift();
                let newmsg = response + entry;
                if(newmsg.length > (1024 - 8)){
                    await msg.channel.send(response);
                    response = entry;
                } else {
                    response = newmsg;
                }
            }
            msg.channel.send(response);
        } else {
            let msg_maker = (msg)=>{
                if(count == length) return;
                const song = player.queue[count];
                const title = count == 0 ? 'Now Playing:' : `${count}:`;
                count += 1;
                msg.channel.send({ embeds: [generateResultEmbed(title,song.info,song.queuer)]}).then(msg_maker);
            }
            msg_maker(msg);
        }*/
    }
}

exports.dequeue = {
    description: "Dequeues the given song index from the song queue.  Use the queue command to get the list of songs in the queue.",
    process: function(client, msg, suffix) {
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
        if (VoiceManager.dequeue(msg.guild.id,index)) {
            msg.channel.send(`Removed index ${index} from the queue.`);
        } else {
            msg.channel.send(`Couldn't remove index ${index} from the queue!`);
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
        if (VoiceManager.pause(msg.guild.id)) {
            msg.channel.send( wrap('Playback paused.'));
        } else {
            msg.channel.send("Couldn't pause :(");
        }
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
        if (VoiceManager.unpause(msg.guild.id)) {
            msg.channel.send( wrap('Playback resumed.'));
        } else {
            msg.channel.send("Couldn't resume :(");
        }
    }
}

exports.playlist = {
    usage: "`<https://open.spotify.com/playlist/...|spotify:playlist:...|https://www.youtube.com/playlist?...>`",
    description: "plays Spotify or YouTube playlists",
    process: async function(client, msg, suffix, isEdit) {
        if(isEdit) return;
        // Make sure the suffix exists.
        if (!suffix) return msg.channel.send( wrap('No playlist specified!'));

        // Make sure the user is in voice.
        var arr = msg.guild.channels.cache.filter((v)=>v.type == "voice").filter((v)=>v.members.has(msg.author.id));
        let responseChannel = msg.guild.channels.cache.find((v)=>v.type == "text" && v.name === MUSIC_CHANNEL_NAME) || msg.channel;
        if (arr.length == 0) return msg.channel.send( wrap('You\'re not in a voice channel.'));

        var show_playlist = true;

        // Youtube
        let youtube_uri_re = /www.youtube.com\//i;
        let youtube_uri = youtube_uri_re.exec(suffix);
        if(youtube_uri) {
            let rsp = msg.channel.send("Downloading YouTube playlist...");
            YoutubeDL.getInfo(suffix,["-i","--yes-playlist"], async (err, output) => {
                if(err) {
                    console.log("errors: " + JSON.stringify(err));
                    let response = await rsp;
                    response.edit("Couldn't download that playlist :( Make sure it's publicly available!");
                    return;
                } else {
                    try {
                        let channel = getUserVoiceChannel(msg);
                        if(Array.isArray(output)){
                            for(song of output) {
                                const events = playYoutube(song,channel,msg.author);
                            }
                            let response = await rsp;
                            response.edit("queued " + output.length + " songs");
                        } else {
                            // For playlists of one song the song is returned directly without an enclosing array.
                            const events = playYoutube(output,channel,msg.author);
                            let response = await rsp;
                            response.edit("queued 1 song");
                        }
                    } catch(e) {
                        let response = await rsp;
                        response.edit("Error: " + e);
                        console.log("Error: " + e + "\n When parsing Output: " + JSON.stringify(output));
                    }
                }
            });
            return;
        }
        
        // Spotify
        var playlist_id = null;
        let uri_re = /spotify:playlist:(\w+)/i;
        let uri = uri_re.exec(suffix);
        if(uri) {
            playlist_id = uri[1];
        } else {
            let link_re = /https:\/\/open.spotify.com\/playlist\/(\w+).*/i
            let link = link_re.exec(suffix);
            if(link) {
                playlist_id = link[1];
            }
            //Don't show our playlist embed with an open spotify link since discord makes a nice embed.
            show_playlist = false;
        }
        if(!playlist_id){
            return msg.channel.send("This doesn't look like a youtube or spotify playlist to me...");
        } else {
            try {
                var spotifyApi = new SpotifyWebApi({
                    clientId: AuthDetails.spotify_client_id,
                    clientSecret: AuthDetails.spotify_client_secret
                });
                console.log("requesting spotify access token");
                let result = await spotifyApi.clientCredentialsGrant();
                spotifyApi.setAccessToken(result.body['access_token']);
                console.log("requesting playlist details for " + playlist_id);
                let playlist = await spotifyApi.getPlaylist(playlist_id);
                var embed = null;

                if(show_playlist){
                    embed = {
                         embeds:[{
                            color: 0x1db954,
                            author: {
                                name: playlist.body.owner.display_name,
                            },
                            url: playlist.body.external_urls.spotify,
                            image: {
                                url: playlist.body.images[0].url,
                            },
                            title: playlist.body.name
                        }]
                    };
                }
                let response = await msg.channel.send("Processing playlist: 0 of " + playlist.body.tracks.items.length,embed);
                
                // Now queue up the songs for playback
                console.log("Starting search of youtube for tracks in this playlist...");
                let songs = []
                //Kick off the searches in parallel.
                let searches = new Promise(async (resolve) => {
                    for(item of playlist.body.tracks.items) {
                        let song_search = 'ytsearch1:' + item.track.name + ' ' + item.track.artists[0].name;
                        console.log("Searching for " + item.track.name + ' ' + item.track.artists[0].name);
                        let promise = new Promise((resolve, reject) => {
                            YoutubeDL.getInfo(song_search, ['-i','--max-downloads', '1', '--no-playlist', '--no-check-certificate'], (err,info) =>{
                                if(err){
                                    reject(err);
                                } else {
                                    resolve(info);
                                }
                            });
                        });
                        songs.push(promise);
                        //Throttle our queries somewhat so we don't piss off youtube.
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    console.log("Done searching for " + playlist_id);
                    resolve();
                });
                let loaded = 0;
                let edited = true;
                let channel = getUserVoiceChannel(msg);
                for(song of songs) {
                    try {
                        let info = await song;
                        const events = playYoutube(info,channel,msg.author);
                    } catch (e) {
                        console.log("failed trying to search for a song!");
                        console.error(e);
                    }
                    loaded++;
                    if(edited){
                        edited = false;
                        response.edit("Processing playlist: " + loaded + " of " + playlist.body.tracks.items.length,embed).then(()=>{edited = true;});
                    }
                }
                console.log("All tracks in playlist " + playlist_id + " queued");
                response.edit("playlist queued",embed);
            } catch(e) {
                if(!AuthDetails.spotify_client_id || !AuthDetails.spotify_client_secret){
                    console.log("Missing spotify api credentials. Did you add them to auth.json?");
                }
                console.error(e);
                return msg.channel.send("Couldn't read the playlist :(");
            }
        }
        
    }
}

exports.shuffle = {
    description: "Shuffles the play queue",
    process: function (client, msg, suffix) {
        if(VoiceManager.shuffle(msg.guild.id)) {
            msg.channel.send("Shuffled the play queue!");
        } else {
            msg.channel.send("Couldn't find a player. Are you playing music?");
        }
    }
}

exports.loop = {
    description: "Toggle looping the queue",
    process: function (client, msg, suffix) {
        let result = VoiceManager.loop(msg.guild.id);
        if(result !== 'error') {
            if(result){
                msg.channel.send(wrap('Looping enabled.'));
            } else {
                msg.channel.send(wrap('Looping disabled.'));
            }
        } else {
            msg.channel.send("Couldn't find a player. Are you playing music?");
        }
    }
}
