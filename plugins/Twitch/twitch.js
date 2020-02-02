var request = require("request");
var AuthDetails = require("../../auth.json");
var Discord = require("discord.js");

exports.commands = [
    "twitch_user",
    "twitch"
]

exports.twitch_user = {
	usage: "<user(s)>",
	description: "returns information about the given twitch user(s)",
	process: function(bot,msg,suffix){
        let user_query = "users?login=" + suffix.split(' ').join("&login=")
        console.log(user_query);
		request({
			url: "https://api.twitch.tv/helix/"+user_query,
			headers: {
				'Client-ID': AuthDetails.twitch_client_id
			}
		},
		function(err,res,body){
			var stream = JSON.parse(body);
            console.log(stream);
            if(stream.data.length > 0){
                for(result of stream.data){
                    msg.channel.send("", {
                        embed: {
                            color: 0x4b367c,
                            author: {
                                name: result.display_name,
                                icon_url: result.profile_image_url
                            },
                            description: result.description
                        }
                    });
                }
            } else {
                msg.channel.send("No users found");
            }
		});
	}
}

exports.twitch = {
	usage: "<stream(s)>",
	description: "returns information about the given twitch stream(s)",
	process: function(bot,msg,suffix){
        let twitch_api = "https://api.twitch.tv/helix/";
        let user_query = "users?login=" + suffix.split(' ').join("&login=")
        let stream_query = "streams?user_login=" + suffix.split(' ').join("&user_login=")
        let user_promise = new Promise(function(resolve,reject){
            request({
                url: twitch_api+user_query,
                headers: {
                    'Client-ID': AuthDetails.twitch_client_id
                }
            },
            function(err,res,body){
                let content = JSON.parse(body);
                if(content && content.data && content.data.length > 0){
                    resolve(content.data);
                } else {
                    reject(err,res,body);
                }
            });
        });
        let stream_promise = new Promise(function(resolve,reject){
            
        });
		user_promise.then(users => {
            console.log(JSON.stringify(users));
            let usermap = users.reduce(function(map,element){
                map[element.id] = element;
                return map;
            },{});
            request({
                url: twitch_api+stream_query,
                headers: {
                    'Client-ID': AuthDetails.twitch_client_id
                }
            },
            
            function(err,res,body){
                let content = JSON.parse(body);
                var streams = [];
                if(content && content.data && content.data.length > 0){
                    streams = content.data;
                }
                for(stream of streams){
                    var image = stream.thumbnail_url.replace("{width}","1920").replace("{height}","1080");
                    var status_line;
                    if(stream.type == "live"){
                        status_line = " is live!";
                    } else if(stream.type == "vodcast"){
                        status_line = " is streaming a vodcast";
                    } else {
                        status_line = " is offline";
                        image = stream.offline_image_url
                    }
                    let user = usermap[stream.user_id];
                    delete usermap[stream.user_id];
                    var title;
                    if(stream.title && stream.title.length > 0){
                        title = stream.title;
                    } else {
                        title = "Stream is Live!";
                    }
                    msg.channel.send("",{
                        embed: {
                            color: 0x4b367c,
                            author: {
                                name: user.display_name + status_line
                            },
                            url: "https://www.twitch.tv/"+user.login,
                            title: stream.title,
                            "thumbnail": {
                                url: user.profile_image_url
                            },
                            "image": {
                                url: image
                            },
                            "footer": {
                                "icon_url": "https://media.forgecdn.net/attachments/214/576/twitch.png",
                                "text": stream.viewer_count + " viewers"
                            }
                        }
                    });
                }
                for(userid in usermap){
                    let user = usermap[userid];
                    msg.channel.send("",{
                        embed: {
                            color: 0x4b367c,
                            author: {
                                name: user.display_name + " is offline"
                            },
                            url: "https://www.twitch.tv/"+user.login,
                            title: "Stream is Offline",
                            description: user.description,
                            "thumbnail": {
                                url: user.profile_image_url
                            },
                            "image": {
                                url: user.offline_image_url
                            }
                        }
                    });
                }
            });
        },function(err,res,body){
            console.log(arguments);
            msg.channel.send("User(s) not found :(");
        });
	}
}