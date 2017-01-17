exports.commands = [
	"rss",
	"reddit" //uses the RSS code to read subreddits
]

try{
	var rssFeeds = require("../../rss.json");
} catch(e) {
    console.log("Couldn't load rss.json. See rss.json.example if you want rss feed commands. error: " + e);
}
function loadFeeds(){
    for(var cmd in rssFeeds){
		exports.commands.push(cmd);
        exports[cmd] = {
            usage: "[count]",
            description: rssFeeds[cmd].description,
            url: rssFeeds[cmd].url,
            process: function(bot,msg,suffix){
                var count = 1;
                if(suffix != null && suffix != "" && !isNaN(suffix)){
                    count = suffix;
                }
                rssfeed(bot,msg,this.url,count,false);
            }
        };
    }
}

loadFeeds();

function rssfeed(bot,msg,url,count,full){
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error){
        msg.channel.sendMessage("failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable',function() {
        var stream = this;
        shown += 1
        if(shown > count){
            return;
        }
        var item = stream.read();
        msg.channel.sendMessage(item.title + " - " + item.link, function() {
            if(full === true){
                var text = htmlToText.fromString(item.description,{
                    wordwrap:false,
                    ignoreHref:true
                });
                msg.channel.sendMessage(text);
            }
        });
        stream.alreadyRead = true;
    });
}

exports.rss = {
	description: "lists available rss feeds",
	process: function(bot,msg,suffix) {
		/*var args = suffix.split(" ");
		var count = args.shift();
		var url = args.join(" ");
		rssfeed(bot,msg,url,count,full);*/
		msg.channel.sendMessage("Available feeds:").then(function(){
			for(var c in rssFeeds){
				msg.channel.sendMessage(c + ": " + rssFeeds[c].url);
			}
		});
	}
}
exports.reddit = {
	usage: "[subreddit]",
	description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top psot there instead",
	process: function(bot,msg,suffix) {
		var path = "/.rss"
		if(suffix){
			path = "/r/"+suffix+path;
		}
		rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
	}
}
