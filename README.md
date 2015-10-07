# DiscordBot
A chat bot for discord app based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>

# Features:
- !gif query = returns a gif example !gif cute cats doing stuff
- !game nameofgame => asks the room if anyone wants to play games! "cs" and "hots" are specially defined
- !image query => returns an image (careful, no adult filter)
- !youtube query=> returns a youtube link
- !wiki query=> returns the summary of the first search result on Wikipedia
- !say text => echos text
- !pullanddeploy => pulls changes from your (or this) repo and restarts node. does <strong>not</strong> work for windows!
- !meme memetype "text1" "text2" => returns a meme image. notice the quotes around text, they are vitally important
- !help => returns currently supported memes that are defined in var meme = {
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
- @<botname> servers => returns servers this bot is in
- @<botname> channels => returns channels this bot is in
- @<botname> idle => sets bot status to idle
- @<botname> online => sets bot status to online
- ping => responds to user with pong!
# ToDo:

- Link history
- refactor discord_bot.js. split the msg string, look for command, process instead of a big if block luls (and the whole project. all of this is just quick and dirty)
- make it a module so you can npm install
- better plugin layout, allow for easy plugin drop ins, turn on/turn off
- "pugbomb" returns x number of pug images (pug are an example) corgibomb etc
- !help right now just shows our dank memes
- automatically pull in meme codes and do a fuzzy search on meme type
- voice intergration and DJ features!
- All the things!

# Instructions

requires node (probably 0.12)

pull repo

add auth.json: email/password, youtube API key, username/password for imgflip (example provided)

npm install

node discord_bot.js

# For non-technical users:

1) google and download "node.js msi download" 

2) go through the installer, this tutorial might help http://blog.teamtreehouse.com/install-node-js-npm-windows

3) once installed download this project as a zip from github

4) unpack and navigate to the project on your PC

5) create a file "auth.json" exactly like the auth.json.example that is provided. Replace the information in there with your own.  You can even use your own credentials, itll respond from your name. Or create a new account and add it to your server. The new file should be placed right along side everythign else.

6) Open cmd prompt (hit windows + q and type in cmd). Test that node works, npm -v and node -v should return something.

7) Navigate to wherever you extracted the project with cd. "cd C:\Users\Alex\Downloads\DiscordBot\"

8) Download requirements with "npm install" 

9) Run the bot with "node discord_bot.js"
