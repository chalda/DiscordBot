const fs = require("fs");
const _ = require("lodash");

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  process.exit(1);
});

let Discord;
try {
  Discord = require("discord.js");
} catch (e) {
  console.log(e.stack);
  console.log(process.version);
  console.log("Please run npm install and ensure it passes with no errors!"); // if there is an error, tell to install dependencies.
  process.exit();
}

console.log(
  "Starting DiscordBot\nNode version: " +
  process.version +
  "\nDiscord.js version: " +
  Discord.version
); // send message notifying bot boot-up

console.log("Voice support status:");
try {
  let Voice = require('@discordjs/voice');
  console.log("discord.js voice library found");
  console.log(Voice.generateDependencyReport());
} catch (e) {
  console.log("Voice support unavailable:");
  console.log(e);
}
const VoiceManager = require('./voice_manager');

const AuthDetails = require("./auth.js").getAuthDetails();

if (!AuthDetails.hasOwnProperty("bot_token") || AuthDetails.bot_token === "") {
  console.error(
    "Please create an auth.json or specify environmental variables, the bot cannot run without a bot_token"
  ); // send message for error - no token
  process.exit();
}

// Load custom permissions
let dangerousCommands = ["exec", "eval", "pullanddeploy", "setUsername", "cmdauth", "presence"]; // set array of dangerous commands
let Permissions = {};
try {
  Permissions = require("./permissions.json");
} catch (e) {
  Permissions.global = {};
  Permissions.users = {};
}

for (let i = 0; i < dangerousCommands.length; i++) {
  let cmd = dangerousCommands[i];
  if (!Permissions.global.hasOwnProperty(cmd)) {
    Permissions.global[cmd] = false;
  }
}
Permissions.checkPermission = function (userid, permission) {
  //console.log("Checking " + permission + " permission for " + userid);
  try {
    let allowed = true;
    try {
      if (Permissions.global.hasOwnProperty(permission)) {
        allowed = Permissions.global[permission] === true;
      }
    } catch (e) { }
    try {
      if (Permissions.users[userid].hasOwnProperty("*")) {
        allowed = Permissions.users[userid]["*"] === true;
      }
      if (Permissions.users[userid].hasOwnProperty(permission)) {
        allowed = Permissions.users[userid][permission] === true;
      }
    } catch (e) { }
    return allowed;
  } catch (e) { }
  return false;
};
fs.writeFile(
  "./permissions.json",
  JSON.stringify(Permissions, null, 2),
  (err) => {
    if (err) console.error(err);
  }
);

//load config data
let Config = {};
try {
  Config = require("./config.json");
} catch (e) {
  //no config file, use defaults
  Config.debug = false;
  Config.commandPrefix = "!";
  try {
    if (fs.lstatSync("./config.json").isFile()) {
      // open config file
      console.log(
        "WARNING: config.json found but we couldn't read it!\n" + e.stack
      ); // corrupted config file
    }
  } catch (e2) {
    fs.writeFile("./config.json", JSON.stringify(Config, null, 2), (err) => {
      if (err) console.error(err);
    });
  }
}
if (!Config.hasOwnProperty("commandPrefix")) {
  Config.commandPrefix = "!"; // set bots prefix
}

let messagebox;
let aliases;
try {
  aliases = require("./alias.json");
} catch (e) {
  //No aliases defined
  aliases = {};
}

commands = {
  // all commands list below
  alias: {
    usage: "<name> <actual command>",
    description:
      "Creates command aliases. Useful for making simple commands on the fly.",
    process: function (bot, msg, suffix) {
      let args = suffix.split(" ");
      let name = args.shift();
      if (!name) {
        msg.channel.send(
          Config.commandPrefix + "alias " + this.usage + "\n" + this.description
        );
      } else if (commands[name] || name === "help") {
        msg.channel.send("overwriting commands with aliases is not allowed!");
      } else {
        let command = args.shift();
        aliases[name] = [command, args.join(" ")];
        //now save the new alias
        require("fs").writeFile(
          "./alias.json",
          JSON.stringify(aliases, null, 2),
          null
        );
        msg.channel.send("created alias " + name);
      }
    },
  },
  aliases: {
    description: "Lists all recorded aliases.",
    process: function (bot, msg, suffix) {
      let text = "current aliases:\n";
      for (let a in aliases) {
        if (typeof a === "string") text += a + " ";
      }
      msg.channel.send(text);
    },
  },
  ping: {
    description: "Responds pong; useful for checking if bot is alive.",
    process: function (bot, msg, suffix) {
      msg.channel.send(msg.author + " pong!");
      if (suffix) {
        msg.channel.send("Note that !ping takes no arguments!");
      }
    },
  },
  idle: {
    description: "Sets bot status to idle.",
    process: function (bot, msg, suffix) {
      bot.user.setStatus("idle").then(console.log).catch(console.error);
    },
  },
  online: {
    description: "Sets bot status to online.",
    process: function (bot, msg, suffix) {
      bot.user.setStatus("online").then(console.log).catch(console.error);
    },
  },
  presence: {
    usage: "<presence text>",
    description: "Sets bot's presence.",
    process: function (bot, msg, suffix) {
      if (!suffix){
        bot.user.setPresence({
          activity: {
            name:
              Config.commandPrefix +
              "help | " +
              bot.guilds.cache.size +
              " Servers",
          },
        });
      } else {
        bot.user.setPresence({activity: {name: suffix}}).then(console.log).catch(console.error);
      }
    },
  },
  say: {
    usage: "<message>",
    description: "Bot sends message",
    process: function (bot, msg, suffix) {
      msg.channel.send(suffix);
    },
  },
  announce: {
    usage: "<message>",
    description: "Bot sends message in text to speech.",
    process: function (bot, msg, suffix) {
      msg.channel.send({content: suffix, tts: true });
    },
  },
  msg: {
    usage: "<user> <message to send user>",
    description: "Sends a message to a user the next time they come online.",
    process: function (bot, msg, suffix) {
      let args = suffix.split(" ");
      let user = args.shift();
      let message = args.join(" ");
      if (user.startsWith("<@")) {
        user = user.substr(2, user.length - 3);
      }
      let target = msg.channel.guild.members.fetch({ query: user, limit: 1 });
      target
        .then((result) => {
          messagebox[target.id] = {
            channel: msg.channel.id,
            content: target + ", " + msg.author + " said: " + message,
          };
          updateMessagebox();
          msg.channel.send("Message saved.");
        })
        .catch(console.error);
    },
  },
  // eval: {
  //   usage: "<command>",
  //   description:
  //     'Executes arbitrary javascript in the bot process. User must have "eval" permission.',
  //   process: function (bot, msg, suffix) {
  //     let result = eval(suffix, bot).toString();
  //     if (result) {
  //       msg.channel.send(result);
  //     }
  //   },
  // },
  cmdauth: {
    usage: "<userid> <get/toggle> <command>",
    description:
      "Gets/toggles command usage permissions for the specified user.",
    process: function (bot, msg, suffix) {
      let Permissions = require("./permissions.json");
      let fs = require("fs");

      let args = suffix.split(" ");
      let userid = args.shift();
      let action = args.shift();
      let cmd = args.shift();

      if (userid.startsWith("<@")) {
        userid = userid.substr(2, userid.length - 3);
      }

      let target = msg.channel.guild.members.find("id", userid);
      if (!target) {
        msg.channel.send("Could not find user.");
      } else {
        if (commands[cmd] || cmd === "*") {
          let canUse = Permissions.checkPermission(userid, cmd);
          let strResult;
          if (cmd === "*") {
            strResult = "All commands";
          } else {
            strResult = 'Command "' + cmd + '"';
          }
          if (action.toUpperCase() === "GET") {
            msg.channel.send(
              "User permissions for " + strResult + " are " + canUse
            );
          } else if (action.toUpperCase() === "TOGGLE") {
            if (Permissions.users.hasOwnProperty(userid)) {
              Permissions.users[userid][cmd] = !canUse;
            } else {
              Permissions.users[userid].append({ [cmd]: !canUse });
            }
            fs.writeFile(
              "./permissions.json",
              JSON.stringify(Permissions, null, 2)
            );

            msg.channel.send(
              "User permission for " +
              strResult +
              " set to " +
              Permissions.users[userid][cmd]
            );
          } else {
            msg.channel.send('Requires "get" or "toggle" parameter.');
          }
        } else {
          msg.channel.send("Invalid command.");
        }
      }
    },
  },
};

if (AuthDetails.hasOwnProperty("client_id")) {
  commands["invite"] = {
    description:
      "Generates an invite link you can use to invite the bot to your server.",
    process: function (bot, msg, suffix) {
      msg.channel.send(
        "Invite link: https://discordapp.com/oauth2/authorize?&client_id=" +
        AuthDetails.client_id +
        "&scope=bot&permissions=397489077312"
      ); // send link to invite bot into server.
    },
  };
}

try {
  messagebox = require("./messagebox.json");
} catch (e) {
  //no stored messages
  messagebox = {};
}
function updateMessagebox() {
  require("fs").writeFile(
    "./messagebox.json",
    JSON.stringify(messagebox, null, 2),
    null
  );
}

const intents = new Discord.Intents([
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MESSAGES,
  Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Discord.Intents.FLAGS.DIRECT_MESSAGES,
  Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  Discord.Intents.FLAGS.GUILD_VOICE_STATES
]);

const bot = new Discord.Client({
  intents: intents,
  partials: [
    'MESSAGE',
    'CHANNEL'
  ]
});

let hooks = {
  onMessage: [],
};

bot.on("ready", function () {
  require("./plugins.js").init(hooks);
  console.log(
    "Logged in! Currently serving " +
    bot.guilds.cache.size +
    " servers."
  );
  bot.user.setPresence({
    activities: [{
      name:
        Config.commandPrefix +
        "help | " +
        bot.guilds.cache.size +
        " Servers",
    }],
    status: 'online'
  });
  console.log(
    "Type " + Config.commandPrefix + "help on Discord for a command list."
  );
});

bot.on("disconnected", function () {
  console.log("Disconnected!"); // send message that bot has disconnected.
  process.exit(1); //exit node.js with an error
});

function checkMessageForCommand(msg, isEdit) {
  //check if message is a command
  if (
    msg.author.id != bot.user.id &&
    msg.content.startsWith(Config.commandPrefix)
  ) {
    console.log(
      "treating " + msg.content + " from " + msg.author + " as command"
    );
    let cmdTxt = msg.content
      .split(/\s/)[0]
      .substring(Config.commandPrefix.length);
    var suffix = msg.content.substring(
      cmdTxt.length + Config.commandPrefix.length + 1
    ); //add one for the ! and one for the space
    if (msg.mentions.has(bot.user)) {
      try {
        cmdTxt = msg.content.split(/\s/)[1];
        suffix = msg.content.substring(
          bot.user.mention().length +
          cmdTxt.length +
          Config.commandPrefix.length +
          1
        );
      } catch (e) {
        //no command
        //msg.channel.send("Yes?");
        return false;
      }
    }
    alias = aliases[cmdTxt];
    if (alias) {
      console.log(
        cmdTxt +
        " is an alias, constructed command is " +
        alias.join(" ") +
        " " +
        suffix
      );
      cmdTxt = alias[0];
      suffix = alias[1] + " " + suffix;
    }
    var cmd = commands[cmdTxt];
    if (cmdTxt === "help") {
      //help is special since it iterates over the other commands
      if (suffix) {
        let cmds = suffix.split(" ").filter(function (cmd) {
          return commands[cmd];
        });
        let info = "";
        for (var i = 0; i < cmds.length; i++) {
          let cmd = cmds[i];
          info += "**" + Config.commandPrefix + cmd + "**";
          let usage = commands[cmd].usage;
          if (usage) {
            info += " " + usage;
          }
          let description = commands[cmd].description;
          if (description instanceof Function) {
            description = description();
          }
          if (description) {
            info += "\n\t" + description;
          }
          info += "\n";
        }
        if (info.length > 0) {
          msg.channel.send(info);
        } else {
          msg.channel.send(`no command ${suffix}`);
        }
      } else {
        msg.author.send("**Available Commands:**").then(function () {
          try {
            let batch = "";
            let sortedCommands = Object.keys(commands).sort();
            for (let i in sortedCommands) {
              let cmd = sortedCommands[i];
              let info = "**" + Config.commandPrefix + cmd + "**";
              let usage = commands[cmd].usage;
              if (usage) {
                info += " " + usage;
              }
              let description = commands[cmd].description;
              if (description instanceof Function) {
                description = description();
              }
              if (description) {
                info += "\n\t" + description;
              }
              let newBatch = batch + "\n" + info;
              if (newBatch.length > 1024 - 8) {
                //limit message length
                msg.author.send(batch);
                batch = info;
              } else {
                batch = newBatch;
              }
            }
            if (batch.length > 0) {
              msg.author.send(batch);
            }
          } catch (e) {
            console.error("UNABLE TO SEND. Command requester " + msg.author.username + " has not turned on 'Allow Direct Messages from Server Members'. This is not a crash.");
            msg.channel
              .send(msg.author.username + ", Please allow direct messages for this server before running this command!")
              .then((message) => message.delete({ timeout: 5000 }));
          }
        });
      }
      return true;
    } else if (cmd) {
      if (Permissions.checkPermission(msg.author.id, cmdTxt)) {
        try {
          cmd.process(bot, msg, suffix, isEdit);
        } catch (e) {
          let msgTxt = "command " + cmdTxt + " failed :(";
          console.error(e);
          if (Config.debug) {
            msgTxt += "\n" + e.stack;
            console.log(msgTxt);
          }
          if (msgTxt.length > 1024 - 8) {
            //Truncate the stack if it's too long for a discord message
            msgTxt = msgTxt.substr(0, 1024 - 8);
          }
          msg.channel.send(msgTxt);
        }
      } else {
        msg.channel.send("You are not allowed to run " + cmdTxt + "!");
      }
      return true;
    } else {
      msg.channel
        .send(cmdTxt + " is not recognized as a command!")
        .then((message) => message.delete({ timeout: 5000 }));
      return true;
    }
  } else {
    //message is not a command or is from us
    //drop our own messages to prevent feedback loops
    if (msg.author == bot.user) {
      return true; //returning true to prevent feedback from commands
    }

    if (msg.author != bot.user && msg.mentions.has(bot.user)) {
      //msg.channel.send("yes?"); //using a mention here can lead to looping
    } else {
    }
    return false;
  }
}

if (Config.debug) {
  bot.on("debug", (info) => {
    console.log(info);
  });
}

bot.on("messageCreate", async (msg) => {
  console.log(`message creation ${msg}`);
  if (msg.partial) {
    msg = await msg.fetch();
  }
  if (!checkMessageForCommand(msg, false)) {
    for (msgListener of hooks.onMessage) {
      msgListener(msg);
    }
  }
});
bot.on("messageUpdate", (oldMessage, newMessage) => {
  checkMessageForCommand(newMessage, true);
});

bot.on('interactionCreate', (interation) => {
  console.log(`interaction: ${JSON.stringify(interation)}`);
});

//Log user status changes
bot.on("presence", function (user, status, gameId) {
  //if(status === "online"){
  //console.log("presence update");
  console.log(user + " went " + status);
  //}
  try {
    if (status != "offline") {
      if (messagebox.hasOwnProperty(user.id)) {
        console.log("Found message for " + user.id);
        let message = messagebox[user.id];
        let channel = bot.channels.get("id", message.channel);
        delete messagebox[user.id];
        updateMessagebox();
        bot.send(channel, message.content);
      }
    }
  } catch (e) { }
});

exports.addCommand = function (commandName, commandObject) {
  try {
    commands[commandName] = commandObject;
  } catch (err) {
    console.log(err);
  }
};
exports.commandCount = function () {
  return Object.keys(commands).length;
};
if (AuthDetails.bot_token) {
  console.log("logging in with token");
  bot.login(AuthDetails.bot_token);
} else {
  console.log(
    "Logging in with user credentials is no longer supported!\nYou can use token based log in with a user account; see\nhttps://discord.js.org/#/docs/main/master/general/updating."
  );
}
