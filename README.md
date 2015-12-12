# DiscordBot
A chat bot for discord app based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>

# Features:
- !gif query = returns a gif example !gif cute cats doing stuff
- !game nameofgame => asks the room if anyone wants to play games!
- !image query => returns an image (careful, no adult filter)
- !youtube query=> returns a youtube link
- !wiki query=> returns the summary of the first search result on Wikipedia
- !wolfram query => queries Wolfram Alpha for results
- !meme memetype "text1" "text2" => returns a meme image. notice the quotes around text, they are vitally important
- !say text => echos text
- !alias => create custom shorthand commands in channel!
- !join-server => bot will join the requested server
- !create => create a channel
- !delete => deletes a channel
- @botname => responds when @mentioned

And much more! Try !help to get a full list of available commands

## RSS:
you can create an rss.json file adding rss feeds as commands. See rss.json.example for details

## Image

the !image and !ggif commands use Google Custom Search to provide results.
Setup is somewhat complex, please follow instructions at
https://stackoverflow.com/questions/34035422/google-image-search-says-api-no-longer-available
the api key and custom search key must be set in auth.json for the commands to work.

# ToDo:
- Permissions!
- Link history
- make it a module so you can npm install
- better plugin layout, allow for easy plugin drop ins, turn on/turn off
- "pugbomb" returns x number of pug images (pug are an example) corgibomb etc
- automatically pull in meme codes and do a fuzzy search on meme type
- voice intergration and DJ features!
- All the things!

# Instructions

requires node (probably 0.12)

pull repo

add auth.json: email/password, youtube API key, username/password for imgflip (example provided)

npm install

node discord_bot.js

### Note on Dependencies

Some of the dependencies we use require a C compiler and Python, so you will
need to have those in your path to run npm install successfully. This is mostly a problem for Windows users.

# For non-technical users:

1) google and download "node.js msi download"

2) go through the installer, this tutorial might help http://blog.teamtreehouse.com/install-node-js-npm-windows

3) once installed download this project as a zip from github

4) unpack and navigate to the project on your PC

5) create a file "auth.json" exactly like the auth.json.example that is provided. Replace the information in there with your own.  You can even use your own credentials, itll respond from your name. Or create a new account and add it to your server. The new file should be placed right along side everythign else.

6) Open cmd prompt (hit windows + q and type in cmd). Test that node works, npm -v and node -v should return something.

7) Navigate to wherever you extracted the project with cd. "cd C:\Users\Alex\Downloads\DiscordBot\"

8) Download requirements with "npm install"
- it seems a lot of people have problems with this step, please follow this guide: http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm

9) Run the bot with "node discord_bot.js"
