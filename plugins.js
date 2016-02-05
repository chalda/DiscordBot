
var fs = require('fs'),
    path = require('path');
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

var plugin_folders = getDirectories("./plugins");
var doNotLoadList = [];
exports.init = function(){
    doNotLoadList = createDoNotLoadList();
    preload_plugins();
}

function createDoNotLoadList(){
    var list = [];
    for (var i = 0; i < plugin_folders.length; i++) {
        if(findMaliciousIntent("./plugins/" + plugin_folders[i] + "/")){
            list.push(plugin_folders[i]);
        }
    }
    return list;
}

function createNpmDependenciesArray (packageFilePath) {
    var p = require(packageFilePath);
    if (!p.dependencies) return [];
    var deps = [];
    for (var mod in p.dependencies) {
        deps.push(mod + "@" + p.dependencies[mod]);
    }

    return deps;
}

function preload_plugins(){
    var deps = [];
    var npm = require("npm");
    var options = require('./options.json');
    for (var i = 0; i < plugin_folders.length; i++) {
        if(doNotLoadList.indexOf(plugin_folders[i]) > -1 && !(options.allowedPlugins[plugin_folders[i]])){
            console.log('\x1b[33m%s\x1b[0m ', "Plugin " + plugin_folders[i] + " NOT loaded. To allow this plugin change it's value to true in options.json");
            continue;
        }else if(doNotLoadList.indexOf(plugin_folders[i]) > -1 && options.allowedPlugins[plugin_folders[i]]){
            console.log('\x1b[32m%s\x1b[0m ', "Plugin " + plugin_folders[i] + " was allowed, loaded plugin");
        }
        try{
            require("./plugins/" + plugin_folders[i]);
        } catch(e) {
            deps = deps.concat(createNpmDependenciesArray("./plugins/" + plugin_folders[i] + "/package.json"));
        }
    }
    if(deps.length > 0) {
        npm.load({
            loaded: false
        }, function (err) {
            // catch errors
            npm.commands.install(deps, function (er, data) {
                if(er){
                    console.log(er);
                }
                console.log("Plugin preload complete");
                load_plugins()
            });

            if (err) {
                console.log("preload_plugins: " + err);
            }
        });
    } else {
        console.log("Plugin preload complete");
        load_plugins()
    }
}

function load_plugins(){
    var dbot = require("./discord_bot.js");
    var commandCount = 0;
    var options = require('./options.json');
    for (var i = 0; i < plugin_folders.length; i++) {
        if(doNotLoadList.indexOf(plugin_folders[i]) > -1 && !(options.allowedPlugins[plugin_folders[i]])){
            continue;
        }
        var plugin;
        try{
            plugin = require("./plugins/" + plugin_folders[i])
        } catch (err){
            console.log("Improper setup of the '" + plugin_folders[i] +"' plugin. : " + err);
        }
        if (plugin){
            if("commands" in plugin){
                for (var j = 0; j < plugin.commands.length; j++) {
                    if (plugin.commands[j] in plugin){
                        dbot.addCommand(plugin.commands[j], plugin[plugin.commands[j]])
                        commandCount++;
                    }
                }
            }
        }
    }
    console.log("Loaded " + dbot.commandCount() + " chat commands type !help in Discord for a commands list.")
}

function findMaliciousIntent(dirname){
    var maliciousKeyWords = [
        ["updateMessage", "Can change previous messages"]
        , ["deleteMessage", "Can delete previous messages"]
        , ["createChannel", "Can create new channels"]
        , ["deleteChannel", "Can delete channels"]
        , ["banMember", "Can ban members"]
        , ["unbanMember", "Can unban members"]
        , ["kickMember", "Can kick members"]
        , ["moveMember", "Can move members"]
        , ["setChannelTopic", "Can update channel topic"]
        , ["setChannelName", "Can update channel name"]
        , ["setChannelNameAndTopic", "Can update channel name and topic"]
        , ["createRole", "Can create new roles"]
        , ["updateRole", "Can change existing roles"]
        , ["deleteRole", "Can delete existing roles"]
        , ["addMemberToRole", "Can add members to roles"]
        , ["removeMemberFromRole", "Can remove members from roles"]
        , ["overwritePermissions", "Can change permissions of a role or user"]

    ]
    var filenames = fs.readdirSync(dirname);
    var maliciousIntents = [];
    for(var i = 0; i < filenames.length; i++) {
        var content = fs.readFileSync(dirname + filenames[i], 'utf-8')
        if (typeof content == "string") {
            for (var j = 0; j < maliciousKeyWords.length; j++) {
                if(content.search(maliciousKeyWords[j][0]) > -1){
                    maliciousIntents.push(maliciousKeyWords[j]);
                }
            }
            if(maliciousIntents.length > 0) {//found some function calls to maybe do bad things
                console.log('\x1b[33m%s\x1b[0m ', "--------------------");
                console.log('\x1b[31m%s\x1b[0m ', "WARNING! " + filenames[i] + " could perform malicious actions including but not limited to: ");
                for (var i = 0; i < maliciousIntents.length; i++) {
                    console.log("- " + maliciousIntents[i][1]);
                }
                console.log('\x1b[33m%s\x1b[0m ', "in path " + dirname);
                console.log('\x1b[33m%s\x1b[0m ', "--------------------");
            }
        }
    }
    if(maliciousIntents.length > 0){
        return true;
    } else return false;
}
