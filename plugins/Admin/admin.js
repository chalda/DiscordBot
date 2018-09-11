exports.commands = [
    "setUsername",
    "log",
    "uptime",
    "perm"
]

var fs = require("fs");
var startTime = Date.now();

exports.setUsername = {
    description: "sets the username of the bot. Note this can only be done twice an hour!",
    process: function(bot,msg,suffix) {
        bot.user.setUsername(suffix);
    }
}

exports.log = {
    usage: "<log message>",
    description: "logs message to bot console",
    process: function(bot,msg,suffix){console.log(msg.content);}
}

exports.uptime = {
    usage: "",
    description: "returns the amount of time since the bot started",
    process: function(bot,msg,suffix){
        var now = Date.now();
        var msec = now - startTime;
        console.log("Uptime is " + msec + " milliseconds");
        var days = Math.floor(msec / 1000 / 60 / 60 / 24);
        msec -= days * 1000 * 60 * 60 * 24;
        var hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        var mins = Math.floor(msec / 1000 / 60);
        msec -= mins * 1000 * 60;
        var secs = Math.floor(msec / 1000);
        var timestr = "";
        if(days > 0) {
            timestr += days + " days ";
        }
        if(hours > 0) {
            timestr += hours + " hours ";
        }
        if(mins > 0) {
            timestr += mins + " minutes ";
        }
        if(secs > 0) {
            timestr += secs + " seconds ";
        }
        msg.channel.send("**Uptime**: " + timestr);
    }
}
exports.perm = {
    usage: "set <can be @user or @role> or rm <can be @user or @role>",
    description: "Used to set(add) or remove permissions from a @user or @role",
    process: function(bot,msg,arg){
        var args = arg.split(" ");
        var permsFile = require("../../permissions.json");
        var user, role;
        if(args[0] == "set"){
        if(typeof args[1] != 'undefined' && typeof args[2] != 'undefined' && typeof args[3] != 'undefined'){
            var node1 = args[2];
            var perm1;
            if(args[3] == "true"){ perm1 = true; }else{ perm1 = false; }
            try{
                if(msg.mentions.users.first()){ console.log('User mention'); user = msg.mentions.users.first().id; }
                if(msg.mentions.roles.first()){ console.log('Role mention '+msg.mentions.roles.first().id); role = msg.mentions.roles.first().id; }
            }catch(err){ console.log('Error occured at: '+err+' Mentions.first() is undefined'); }
            if(typeof user != 'undefined'){
                if(typeof permsFile.users[user] == 'undefined'){ permsFile.users[user] = {[node1]:perm1}; }
                else{ permsFile.users[user][node1] = perm1; }
            }else if(typeof role != 'undefined'){
                if(typeof permsFile.roles[role] == 'undefined'){ permsFile.roles[role] = {[node1]:perm1}; }
                else{ permsFile.roles[role][node1] = perm1; }
            }
        }else{ msg.channel.send('__Parameters can\'t be left blank: '+typeof args[1]+', '+typeof args[2]+', '+typeof args[3]+'__'); }
        }else if(args[0] == "rm"){
            if(typeof args[1] != 'undefined' && typeof args[2] != 'undefined'){
                var node1 = args[2];
                try{
                    if(msg.mentions.users.first()){ user = msg.mentions.users.first().id; }
                    if(msg.mentions.roles.first()){ role = msg.mentions.roles.first().id; }
                }catch(err){ console.log('Error occured at: '+err+' Mentions.first() is undefined'); }
                if(typeof user != 'undefined'){ delete permsFile.users[user][node1]; }
                else if(typeof role != 'undefined'){ delete permsFile.roles[role][node1]; }
            }else{ msg.channel.send('__Parameters can\'t be left blank: '+typeof args[1]+', '+typeof args[2]+', '+typeof args[3]+'__'); }
        }else{ msg.channel.send("__Too few Arguments: either add or rm.__"); }
        try{
            if(fs.lstatSync("./permissions.json").isFile()){ console.log("WARNING: permissions.json found but we couldn't read it!\n" + e.stack); }
        } catch(e2){
            if (!fs.writeFile("./permissions.json",JSON.stringify(permsFile,null,2))){
                //console.log('Write success!');
            }}
    }
}
