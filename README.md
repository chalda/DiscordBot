# DiscordBot
A chat bot for Discord, built on top of <a href="https://discord.js.org">discord.js</a>.

# Features:

This bot has many many commands. Here are a few highlights:

- `!help [command]` -> Lists all commands or just help for one command.
- `!gif query` -> Returns a gif connected to search query. Example = !gif dogs
- `!image query` -> Returns an image from Google Images (careful, no adult filter) Example: `!image dogs`
- `!youtube query` -> Returns a youtube link. Example: `!youtube Fortnite`
- `!wiki query` -> Returns the summary of the first search result on Wikipedia.
- `!wolfram query` -> Queries Wolfram Alpha for results.
- `!meme memetype "text1" "text2"` => Returns a meme image. notice the quotes around text, they are vitally important!
- `!say text` -> Make the bot say text, useful mostly in combination with `alias`.
- `!alias` -> Create custom shorthand commands in Discord!
- `!join-server` -> Bot will join the requested server, easy way to get the bot in multiple servers.
- Channel management!

Music streaming:
- `!play song` -> Plays the requested song in voice.
- `!skip song` -> Skip currently playing song
- `!queue` -> The queue of songs
- `!queue [number]` -> The removes song from queue

And much more! Try `!help` to get a full list of available commands.

# Installation

This bot runs on [node.js](https://nodejs.org). You will need at least node 12. In order for music playback to work, you will need python and ffmpeg to be present on your system.

## Linux

### General

Install [node 12 or newer]((https://nodejs.org/en/download/)), Python, and FFmpeg, along with a C compiler for npm to use.

Run `npm install` in the bot directory and make sure it passes.

Now set up your `auth.json` and run `npm start` or `node discord_bot.js` to test the bot out!

### Ubuntu

First install the needed system dependencies:
 `sudo apt install build-essential nodejs python ffmpeg`

 Now run `node --version` and make sure it is v12 or later. If not refer to [the node.js download page](https://nodejs.org/en/download/) to get an updated version.

Run `npm install` in the bot directory and make sure it passes.

Now set up your `auth.json` and run `npm start` or `node discord_bot.js` to test the bot out!

## Windows

1. Install [node.js](https://nodejs.org/en/download/)
2. Install [python](https://www.python.org/)
3. Install [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/)
4. Install [FFmpeg](https://www.ffmpeg.org/download.html)
5. Open `x64 Native Tools Command Prompt for VS 2019` and cd to the bot's folder
6. Run `npm install` and make sure it succeeds
7. Set up your `auth.json`
8. Run `npm start` or `node discord_bot.js` to test the bot out!

### Additional Resources

* [Installing Node on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* [npm errors on Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
* [Visual Studio Community 2015](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx)
* [Python 2.7](https://www.python.org/downloads/)

[Tuck 64 was kind enough to make a video walkthrough of the setup process](https://www.youtube.com/watch?v=H-82S2jFOII)

# Setting up
Before the first run you will need to create an `auth.json` file. A bot token is required. The other credentials are not required for the bot to run, but they are highly recommended as commands that depend on them will not function. See `auth.json.example`.

[Please see this excellent guide for how to create your discord bot's account and get your bot token.](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

Verify that the bot runs with your config by running `npm start`.

# Running longterm
Once you've setup your keys and checked that the features you want are working, you have a couple of options for running the bot.

## Selfhosted
You could run the bot along side everything else on your pc. However it's probably a good idea to run your bot on a separate computer such as a linux server or a Raspberry Pi so it does not interfere with your normal operations and to keep it running even if you were to sleep or shutdown your PC. 
We would recommend running the bot in "forever" mode.
Run `npm run forever` to start the bot in a process that will restart it on crashes. If you need to stop running it, navigate to the bot installation folder in a terminal and run `npx forever stopall`.
Running the bot in this mode will save error and console logs to err.log and out.log respectively. You can use Notepad or similar to open these files.

## Cloud Hosted
There is a number of cloud hosting providers that can run small node.js applications like this. The following have been tested to work, you'll have to extrapolate if you want to use some other provider (AWS, etc)

### Running on Heroku
- Create heroku account, install heroku-cli, create a new Dyno.
- Git clone the repo and follow the instructions in the Deploy section to setup pushing to heroku
- Go to settings and setup Config Vars the name of the vars are exactly the same as the auth.json file. You **DO NOT** need the quotes around the values in config vars
- Run `heroku scale worker=1` in the bot installation directory to run the bot as a worker rather than a webserver.
- SOME COMMANDS ARE NOT WORKING, I AM WORKING TO FIX THIS.

### Running on Repl.it
You will still need to create an `auth.json` file with your credentials with this process, follow the steps above.
[![Run on Repl.it](https://repl.it/badge/github/chalda/DiscordBot)](https://repl.it/github/chalda/DiscordBot)



# FAQ
## Music is always saying "invalid video"
You likely need to update youtube-dl. you can do so with `node ./node_modules/youtube-dl/scripts/download.js`

## I don't want some of these commands!
Most of our commands live in the plugins folder, deleting that plugin will easily remove the command. Also see permissions below.

## How do I restrict a command to only certain users?
You will need to set up permissions.json. Please see permissions.json.example.

## Updates
If you update the bot, please run `npm update` before starting it again. If you have
issues with this, you can try deleting your node_modules folder and then running
`npm install` again. Please see [Installation](#Installation).

## RSS
You can create an rss.json file adding rss feeds as commands. See rss.json.example for details.

## Special instructions for setting up google search and youtube APIs:

(thanks @SchwererKonigstiger)

1) Create a Custom Search at: https://cse.google.com/cse/create/new

2) Leave the first line blank, and name the search engine anything you wish.

3) Click "Advanced Options" and then type ImageObject.

4) Hit create.

5) On this new page, enable the Image Search in the menu.

6) Then press "Search engine ID" under the Details header.

7) Copy this into the auth.json's "google_custom_search" section.

Make sure you also have your Google server API key, which is located in the "youtube_api_key" section, or the search will fail.

# Help
Please check the GitHub issues page on this project. We get a lot of similar questions, and it is likely that yours has already been answered. 

If you still need help, feel free to join us on [Discord](https://discord.gg/m29GJBN).
