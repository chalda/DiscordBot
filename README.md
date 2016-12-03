# DiscordBot
A chat bot for discord app based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>

# Features:
- !gif query => returns a gif example !gif cute cats doing stuff
- !image query => returns an image from Google Images (careful, no adult filter)
- !youtube query=> returns a youtube link
- !wiki query=> returns the summary of the first search result on Wikipedia
- !wolfram query => queries Wolfram Alpha for results
- !meme memetype "text1" "text2" => returns a meme image. notice the quotes around text, they are vitally important
- !say text => echos text
- !alias => create custom shorthand commands in channel!
- !join-server => bot will join the requested server
- !talk => talk with the bot!
- @botname => responds when @mentioned
- channel management!

And much more! Try !help to get a full list of available commands

# Installation

This bot is written to run on top of node.js. Please see https://nodejs.org/en/download/

Once you have node installed running `npm install` from the bot directory should install all the needed packages. If this command prints errors the bot won't work!



## Windows Users
Please note that you must have a working C compiler and Python in your path for
`npm install` to work. The bot has been tested to work on Windows using Visual Studio 2015 Community and Python 2.7, except for `!pullanddeploy`.
* [Installing Node on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* [npm errors on Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
* [Visual Studio Community 2015](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx)
* [Python 2.7](https://www.python.org/downloads/)

[Tuck 64 was kind enough to make a video walkthrough of the setup process](https://www.youtube.com/watch?v=H-82S2jFOII)

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

Make sure you also have your google server API key, which goes in the "youtube_api_key" section, or the search will fail.

# Running
Before first run you will need to create an `auth.json` file. A bot token or the email and password for a discord account are required. The other credentials are not required for the bot to run, but highly recommended as commands that depend on them will malfunction. See `auth.json.example`.

To start the bot just run
`node discord_bot.js`.

# Updates
If you update the bot, please run `npm update` before starting it again. If you have
issues with this, you can try deleting your node_modules folder and then running
`npm install` again. Please see [Installation](#Installation).

# ToDo:
All the things!

# Help
Please check github issues page on this project. We get a lot of the same questions, its very likely yours has already been answered. And yes we need to roll those into an official FAQ.

If you still need help join us on [discord.](https://discord.gg/m29GJBN)
