var AuthDetails = {};
try {
    AuthDetails = require("./auth.json");
} catch (e){
	console.log("Please create an auth.json like auth.json.example with a bot token or an email and password.\n"+e.stack); // send message for error - no token 
}

if(!AuthDetails.hasOwnProperty('bot_token')) {
	//attempt to populate from ENV variables. useful for remote cloud deploys
	AuthDetails = {
		bot_token: process.env.bot_token,
		client_id: process.env.client_id,
		youtube_api_key: process.env.youtube_api_key,
		google_custom_search: process.env.youtube_api_key,
		imgflip_username: process.env.imgflip_username,
		imgflip_password: process.env.imgflip_password,
		wolfram_api_key: process.env.wolfram_api_key,
		twitch_client_id: process.env.twitch_client_id
	}
}

exports.getAuthDetails = () => {
    return AuthDetails;
}