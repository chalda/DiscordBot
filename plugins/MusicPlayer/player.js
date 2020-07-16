const YoutubeDL = require('youtube-dl');
//const YoutubeDL = require('ytdl-core');
//const YoutubeDL = equire('ytdl-core-discord');
//const Request = require('request');
const {PassThrough} = require('stream');

const createStream = (options) => {
	const stream = new PassThrough({
	  highWaterMark: options && options.highWaterMark || null,
	});
	stream.destroy = () => { stream._isDestroyed = true; };
	return stream;
  };

var dispatcher;
exports.commands = [
	"play",
	"skip",
	"queue",
	"dequeue",
	"pause",
	"resume",
	"volume"
]

let options = false;
	let PREFIX = (options && options.prefix) || '!';
	let GLOBAL_QUEUE = (options && options.global) || false;
	let MAX_QUEUE_SIZE = (options && options.maxQueueSize) || 20;
	// Create an object of queues.
	let queues = {};

	/*
	 * Gets a queue.
	 *
	 * @param server The server id.
	 */
	function getQueue(server) {
		// Check if global queues are enabled.
		if (GLOBAL_QUEUE) server = '_'; // Change to global queue.

		// Return the queue.
		if (!queues[server]) queues[server] = [];
		return queues[server];
	}

	/*
	 * Play command.
	 *
	 * @param msg Original message.
	 * @param suffix Command suffix.
	 */
exports.play = {
		usage: "<search terms|URL>",
		description: "Plays the given video in the user's voice channel. Supports YouTube and many others: http://rg3.github.io/youtube-dl/supportedsites.html",
		process :function(client, msg, suffix, isEdit){
		if(isEdit) return;
		var arr = msg.guild.channels.cache.filter((v)=>v.type == "voice").filter((v)=>v.members.has(msg.author.id));
		// Make sure the user is in a voice channel.
		if (arr.length == 0) return msg.channel.send( wrap('You\'re not in a voice channel.'));

		// Make sure the suffix exists.
		if (!suffix) return msg.channel.send( wrap('No video specified!'));

		// Get the queue.
		const queue = getQueue(msg.guild.id);

		// Check if the queue has reached its maximum size.
		if (queue.length >= MAX_QUEUE_SIZE) {
			return msg.channel.send( wrap('Maximum queue size reached!'));
		}

		// Get the video information.
		msg.channel.send( wrap('Searching...')).then(response => {
			// If the suffix doesn't start with 'http', assume it's a search.
			if (!suffix.toLowerCase().startsWith('http')) {
				suffix = 'ytsearch1:' + suffix;
			}

			// Get the video info from youtube-dl.
			YoutubeDL.getInfo(suffix, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
				// Verify the info.
				//|| info.format_id === undefined || info.format_id.startsWith('0')
				if (err ) {
					return response.edit( wrap('Invalid video!!'));
				}

				var result = info[0] || info;

				// Queue the video.
				response.edit( wrap('Queued: ' + result.title)).then((resp) => {
					queue.push(result);

					// Play if only one element in the queue.
					if (queue.length === 1) {
						executeQueue(client, msg, queue);
						resp.delete({timeout: 1000});
					}
				}).catch(() => {});
			})
		}).catch(() => {});
	}
}

	/*
	 * Skip command.
	 *
	 * @param msg Original message.
	 * @param suffix Command suffix.
	 */
exports.skip = {
	description: "skips to the next song in the playback queue",
	process:function(client, msg, suffix) {
		// Get the voice connection.
		const voiceConnection = client.voiceConnections.get(msg.guild.id);
		if (voiceConnection === null) return msg.channel.send( wrap('No music being played.'));

		// Get the queue.
		const queue = getQueue(msg.guild.id);

		// Get the number to skip.
		let toSkip = 1; // Default 1.
		if (!isNaN(suffix) && parseInt(suffix) > 0) {
			toSkip = parseInt(suffix);
		}
		toSkip = Math.min(toSkip, queue.length);

		// Skip.
		queue.splice(0, toSkip - 1);

		// Resume and stop playing.
		if (dispatcher){ 
			dispatcher.resume();
			dispatcher.end();
		}

		msg.channel.send( wrap('Skipped ' + toSkip + '!'));
	}
}

	/*
	 * Queue command.
	 *
	 * @param msg Original message.
	 * @param suffix Command suffix.
	 */
exports.queue = {
	description: "prints the current music queue for this server",
	process: function(client, msg, suffix) {
		// Get the queue.
		const queue = getQueue(msg.guild.id);

		// Get the queue text.
		const text = queue.map((video, index) => (
			(index + 1) + ': ' + video.title
		)).join('\n');

		// Get the status of the queue.
		let queueStatus = 'Stopped';
		const voiceConnection = client.voiceConnections.get(msg.guild.id);
		if (voiceConnection !== null && voiceConnection != undefined) {
			queueStatus = voiceConnection.paused ? 'Paused' : 'Playing';
		}

		// Send the queue and status.
		msg.channel.send( wrap('Queue (' + queueStatus + '):\n' + text));
	}
}

	/*
	 * Dequeue command.
	 *
	 * @param msg Original message.
	 * @param suffix Command suffix.
	 */
exports.dequeue = {
	description: "Dequeues the given song index from the song queue.  Use the queue command to get the list of songs in the queue.",
	process: function(client, msg, suffix) {
		// Define a usage string to print out on errors
		const usageString = 'The format is "!dequeue <index>".  Use !queue to find the indices of each song in the queue.';
		
		// Get the queue.
		const queue = getQueue(msg.guild.id);

		// Make sure the suffix exists.
		if (!suffix)
			return msg.channel.send( wrap('You need to specify an index to remove from the queue.  ' + usageString));

		// Get the arguments
		var split = suffix.split(/(\s+)/);

		// Make sure there's only 1 index 
		if (split.length > 1)
			return msg.channel.send( wrap('There are too many arguments.  ' + usageString));
		
		// Remove the index
		var index = parseInt(split[0]);
		var songRemoved = ''; // To be filled out below
		if (!isNaN(index)) {
			index = index - 1;
			
			if (index >= 0 && index < queue.length) {
				songRemoved = queue[index].title;
				
				if (index == 0) {
					// If it was the first one, skip it
					if (dispatcher) {
						dispatcher.resume();
						dispatcher.end();
					}
				} else {
					// Otherwise, just remove it from the queue
					queue.splice(index, 1);
				}				
			} else {
				return msg.channel.send( wrap('The index is out of range.  ' + usageString));
			}
		} else {
			return msg.channel.send( wrap('That index isn\'t a number.  ' + usageString));
		}
		
		// Send the queue and status.
		msg.channel.send( wrap('Removed \'' + songRemoved + '\' (index ' + split[0] + ') from the queue.'));
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
		// Get the voice connection.
		const voiceConnection = client.voiceConnections.get(msg.guild.id);
		if (voiceConnection == null) return msg.channel.send( wrap('No music being played.'));

		// Pause.
		msg.channel.send( wrap('Playback paused.'));
		if (dispatcher) dispatcher.pause();
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
		// Get the voice connection.
		const voiceConnection = client.voiceConnections.get(msg.guild.id);
		if (voiceConnection == null) return msg.channel.send( wrap('No music being played.'));

		// Resume.
		msg.channel.send( wrap('Playback resumed.'));
		if (dispatcher) dispatcher.resume();
	}
}

/*
 * Set Volume command.
 *
 * @param msg Original message.
 * @param suffix Command suffix.
 */
exports.volume = {
	usage: "<volume|volume%|volume dB>",
	description: "set music playback volume as a fraction, a percent, or in dB",
	process: function(client, msg, suffix) {
		// Get the voice connection.
		const voiceConnection = client.voiceConnections.get(msg.guild.id);
		if (voiceConnection == null) return msg.channel.send( wrap('No music being played.'));
		// Set the volume
		if (dispatcher) {
			if(suffix == ""){
				var displayVolume = Math.pow(dispatcher.volume,0.6020600085251697) * 100.0;
				msg.channel.send(wrap("volume: " + displayVolume + "%"));
			} else {
				if(suffix.toLowerCase().indexOf("db") == -1){
					if(suffix.indexOf("%") == -1){
						if(suffix > 1) suffix /= 100.0;
						dispatcher.setVolumeLogarithmic(suffix);
					} else {
						var num = suffix.split("%")[0];
						dispatcher.setVolumeLogarithmic(num/100.0);
					}
				} else {
					var value = suffix.toLowerCase().split("db")[0];
					dispatcher.setVolumeDecibels(value);
				}
			}
		}
	}
}

	/*
	 * Execute the queue.
	 *
	 * @param msg Original message.
	 * @param queue The queue.
	 */
function executeQueue(client, msg, queue) {
		// If the queue is empty, finish.
		if (queue.length === 0) {
			msg.channel.send( wrap('Playback finished.'));

			// Leave the voice channel.
			const voiceConnection = client.voiceConnections.get(msg.guild.id);
			if (voiceConnection != null) {
				dispatcher.end();
				voiceConnection.channel.leave();
				return;
			}
		}

		new Promise((resolve, reject) => {
			// Join the voice channel if not already in one.
			const voiceConnection = client.voiceConnections.get(msg.guild.id);
			if (voiceConnection == null) {
				// Check if the user is in a voice channel.
				var voiceChannel = getAuthorVoiceChannel(msg);
				if (voiceChannel != null) {
					voiceChannel.join().then(connection => {
						resolve(connection);
					}).catch(console.error);
				} else {
					// Otherwise, clear the queue and do nothing.
					queue.splice(0, queue.length);
					reject();
				}
			} else {
				resolve(voiceConnection);
			}
		}).then(connection => {
			// Get the first item in the queue.
			const video = queue[0];

			// Play the video.
			msg.channel.send( wrap('Now Playing: ' + video.title)).then((cur) => {
				//console.log(YoutubeDL);
				var playbackStream = createStream({highWaterMark: 1<<25 })
				// });
				YoutubeDL( video ,['--audio-format opus', 
				'--quality highestaudio', '-o -', '--exec "ffmpeg -reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 4 -i {} -ac 2 -codec:a libopus -b:a 64k -vbr on -compression_level 10 -frame_duration 60 -application audio"' ]).pipe(playbackStream)
				// console.log(stream, video)
				dispatcher = connection.play(playbackStream), {
					seek: 0,
					passes: 3, 
					volume: 1,
					bitrate: 'auto'}
				//, {format:'opus', quality: 'highestaudio'}
				//['--format=18']
				//dispatcher.then(intent => {
					dispatcher.on('debug',(i)=>console.log("debug: " + i));
					// Catch errors in the connection.
					dispatcher.on('error', (err) => {
						msg.channel.send("fail: " + err);
						// Skip to the next song.
						queue.shift();
						executeQueue(client, msg, queue);
					});

					// Catch the end event.
					dispatcher.on('end', () => {
						// Wait a second.
						setTimeout(() => {
							// Remove the song from the queue.
							queue.shift();

							// Play the next song in the queue.
							executeQueue(client, msg, queue);
						}, 1000);
					});
				//}).catch((ex) => {msg.channel.send("playStream fail: " + ex)});//*/
			}).catch(console.error);
		}).catch(console.error);
	}

function getAuthorVoiceChannel(msg) {
	var voiceChannelArray = msg.guild.channels.filter((v)=>v.type == "voice").filter((v)=>v.members.has(msg.author.id)).array();
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
