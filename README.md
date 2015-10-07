# DiscordBot
A chat bot for discord app based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>

# Features:
- !gif <query> = returns a gif
- !game nameofgame => asks the room if anyone wants to play games! "cs" and "hots" are specially defined
- !image => returns an image
- !youtube => returns a youtube link
- !say <text> => echos text
- !pullanddeploy => pulls changes from your (or this) repo and restarts node. does <strong>not</strong> work for windows!
- !meme <memetype> <text1> <text2> => returns a meme image.
- currently supported memes are defined in var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716
};
- !version => last deployed commit

# ToDo:

- Link history
- "pugbomb" returns x number of pug images (pug are an example)
- !help
- automatically pull in meme codes and do a fuzzy search on meme type
- voice intergration and DJ features!

# Instructions

requires node (probably 0.12)

pull repo

add auth.json: email/password, youtube API key, username/password for imgflip (example provided)

npm install

node discord_bot.js
