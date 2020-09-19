# DiscordBot
A chat bot for Discord, built on top of <a href="https://discord.js.org">discord.js</a>.

# Features:

This bot has many many commands. Here are a few highlights:

- `!help [command]` -> Lists all commands or just help for one command.
- `!play song` -> Plays the requested song in voice.
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

And much more! Try `!help` to get a full list of available commands.

# Installation

This bot runs on [node.js](https://nodejs.org). You will need at least node 12. In order for music playback to work, you will need python and ffmpeg to be present on your system.

## Linux

### General

Install [node 12 or newer]((https://nodejs.org/en/download/)), Python, and FFmpeg, along with a C compiler for npm to use.

Run `npm install` in the bot directory and make sure it passes.

Now set up your `auth.json` and run `node discord_bot.js` to test the bot out!

### Ubuntu

First install the needed system dependencies:
 `sudo apt install build-essential nodejs python ffmpeg`

 Now run `node --version` and make sure it is v12 or later. If not refer to [the node.js download page](https://nodejs.org/en/download/) to get an updated version.

Run `npm install` in the bot directory and make sure it passes.

Now set up your `auth.json` and run `node discord_bot.js` to test the bot out!

## Windows

1. Install [node.js](https://nodejs.org/en/download/)
2. Install [python](https://www.python.org/)
3. Install [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/)
4. Install [FFmpeg](https://www.ffmpeg.org/download.html)
5. Open `x64 Native Tools Command Prompt for VS 2019` and cd to the bot's folder
6. Run `npm install` and make sure it succeeds
7. Set up your `auth.json`
8. Run `node discord_bot.js` to test the bot out!

### Additional Resources

* [Installing Node on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* [npm errors on Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
* [Visual Studio Community 2015](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx)
* [Python 2.7](https://www.python.org/downloads/)

[Tuck 64 was kind enough to make a video walkthrough of the setup process](https://www.youtube.com/watch?v=H-82S2jFOII)

## Running on Repl.it
You will still need to create an `auth.json` file with your credentials with this process, follow the steps above.
[![Run on Repl.it](https://repl.it/badge/github/chalda/DiscordBot)](https://repl.it/github/chalda/DiscordBot)

# Running
Before the first run you will need to create an `auth.json` file. A bot token is required. The other credentials are not required for the bot to run, but they are highly recommended as commands that depend on them will not function. See `auth.json.example`.

[Please see this excellent guide for how to create your discord bot's account and get your bot token.](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

To start the bot just run
`node discord_bot.js`.

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
