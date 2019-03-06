exports.commands = [
	"mixer",
	"chuckNorris",
	//"watchtogether",
	"ping",
	"rip",
	"warp",
	"features"
]

//a collection of simple self contained commands with no dependencies beyond request

exports.mixer = {
	usage: "<stream>",
	description: "checks if the given Mixer stream is online",
	process: function(bot,msg,suffix){
		require("request")("https://mixer.com/api/v1/channels/"+suffix,
		function(err,res,body){
			var data = JSON.parse(body);
			if(data && data.online){
				msg.channel.send( suffix
					+" is online"
					+"\n"+data.thumbnail.url)
			}else{
				msg.channel.send( suffix+" is offline")
			}
		});
	}
}

exports.chuckNorris = {
	usage: "<joke>",
	description: "gives a random Chuck Norris joke",
	process: function(bot, msg, suffix) {
		require("request")("http://api.icndb.com/jokes/random",
		function(err, res, body) {
			var data = JSON.parse(body);
			if (data && data.value && data.value.joke) {
			msg.channel.send(data.value.joke)
			}
		});
	}
}

/*exports.watchtogether = {
	usage: "[video url (Youtube, Vimeo)",
	description: "Generate a watch2gether room with your video to watch with your friends!",
	process: function(bot,msg,suffix){
		var watch2getherUrl = "https://www.watch2gether.com/go#";
		msg.channel.send(
			"watch2gether link").then(function(){
				msg.channel.send(watch2getherUrl + suffix)
		})
	}
}*/

    exports.ping = {
        description: "responds pong, useful for checking if bot is alive",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage( "pong!");
            if(suffix){
                msg.author.sendMessage( "+ping takes no arguments!");
            }
	    if (msg.channel.id == "300808172371836928") { // This ID belongs to a channel in a random server. If you say +ping in that channel, it responds as below.
		msg.channel.sendMessage("The FitnessGram™ Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly, but gets faster each minute after you hear this signal. [beep] A single lap should be completed each time you hear this sound. [ding] Remember to run in a straight line, and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark, get ready, start.");
            }
	}
    }

    exports.rip = {
        description: "Rests something in pepperoni",
        process: function(bot, msg, suffix) {
	    var riparoo = "";
		if(suffix){
                riparoo = suffix;
		riparoo = riparoo.replace('my', msg.author + '\'s');
		} else {
		riparoo = msg.author;
            	};
	    var restArray = ['riparoony', 'riparoo', 'rest', 'rip', 'reset', 'remember', 'ripadoodle', 'restaroony', 'resta', 'ring', 'resurrect', 'respawn'];
	    var peaceArray = ['peace', 'pepperoni', 'pepperoncini', 'pizza', 'pieces', 'prezzies', 'potatoes', 'pasta', 'pastaroni', 'poop', 'pokemon', 'pie'];
		var randRest = Math.floor(Math.random() * restArray.length); var rrip = restArray[randRest];
		var randPeace = Math.floor(Math.random() * peaceArray.length); var prip = peaceArray[randPeace];
		
            msg.channel.sendMessage( rrip + " in " + prip + ", " + riparoo).then((message => msg.delete(1000)));
        }
    }

   exports.warp = {
	   description: "Opens a temporary wormhole to another channel or literally repeats what you said",
	   process: function(bot, msg, suffix) {
		   msg.channel.sendMessage(suffix).then((message => message.delete(10000)));
		   msg.delete(100);
	   }
   }

   exports.features = {
        description: "Lists features and commands.",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage( "FEATURES:\n +rip (content): Rests some content in pepperoni.\nThis feature is still being worked on. Check back later.");
	    if (msg.channel.id == "301360041473081346") { // LOGIC: If the ID of the channel belongs to #trick-room of BlakiniLive, send the message.
		msg.channel.sendMessage("The FitnessGram™ Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly, but gets faster each minute after you hear this signal. [beep] A single lap should be completed each time you hear this sound. [ding] Remember to run in a straight line, and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark, get ready, start.");
            }
	}
    }
