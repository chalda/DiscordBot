/* File: stream.js
 * Description: Used to semi automate the creation of multistre.am links (mainly for the community I am apart of)
 * Author: Fang_Shadow
 * Date: 12/11/17
 * Estimated Time worked: 9 Hours
 */
exports.commands = [
        "multi", //Contains all logic and commands for multi
        "multi_set_community", //information holder only
        "multi_set_client", //Information in help only
        "multi_set_secret", //Information in help only
        "MTP" //Used to add a Channel to timed purge (~15 minute old messages are deleted)
];
const { JSDOM } = require("jsdom");
const jquery = require("jquery");
var fs = require("fs");
var append;


// global envs for JSDOM and JQuery
global.document = new JSDOM('<!doctype html><html><body></body></html>');
global.$ = jquery(global.document.window);
var Stream_data = {};
var User_data = {};
var link_count = 0;

exports.multi_set_community = { //forces !multi set community to show
        usage: "<community name>",
        description: "Enter the community name to set it."
}
exports.multi_set_client = { //forces !multi set client to show
        usage: "<twitch app client id>",
        description: "Enter the client id for the twitch app you registered to set it."
}
exports.multi_set_client = { //forces !multi set client to show
        usage: "<twitch app secret>",
        description: "Enter the secret for the twitch app you registered to set it."
}

exports.multi = { //Where all majick happens
        usage: "",
        description: "Used to get multi-links for twitch multistre.am. (WIP)",
        process: function(bot, msg, arg) {
            var Guild = require("../../guilds/"+ msg.guild.name +".json");
            var args = arg.split(" ");
            //var args = arg;
            if(!arg){
                if(msg.guild != null){
                    if(Guild.client_id == ""){
                        msg.channel.send("__Client ID not set! Please use !multi set client to do so.__");
                        return;
                    }
                    if(Guild.secret == ""){
                        msg.channel.send("__Secret not set! Please use !multi set secret to do so.__");
                        return;
                    }
                    if(Guild.commid == "" || Guild.community == ""){
                        msg.channel.send("__Community & | Community id not set! Please use !multi set community to do so.__");
                        return;
                    }
                    link_count = 1;
                    User_data = {};
                    Stream_data = {};
                    getStreams(Guild.commid,Guild.client_id,msg);
                }else{
                        msg.channel.send("__Command needs to be sent from a Server Channel!__");
                }
            } else if(args[0] == "set"){
                if(args[1] == "community"){
                    if(Guild.client_id == ""){
                        msg.channel.send("__Client ID not set! Please use !multi set client to do so.__");
                        return;
                    }
                    getCommID(msg.channel,Guild.client_id,args[2],function(call){
                              if(call != null){
                              append = appendJSON(args[2],null,null,null,call._id,msg);
                              } else {
                              append = "Failed!";
                              }
                              msg.channel.send("__Community ID: "+append+"__");
                              });
                } else if(args[1] == "client"){
                    if(msg.guild == null){
                        msg.author.send("Please use this command on a Server!");
                        return;
                    }else{
                    append = appendJSON(null,args[2],null,null,null,msg);
                    msg.channel.send("__Client ID: "+append+"__");
                    }
                } else if(args[1] == "secret"){
                    if(msg.guild == null){
                        msg.author.send("Please use this command on a server!");
                        return;
                    }else{
                        if(Guild.client_id == ""){
                            msg.channel.send("__Client ID not set! Please use !multi set client to do so.__");
                        }
                        getAccessKey(Guild.client_id,args[2],function(call){
                                     if(typeof call.access_token != 'undefined'){
                                     append = appendJSON(null,null,args[2],call.access_token,null,msg);
                                     } else {
                                     append = "Failed!";
                                     }
                                     msg.channel.send("__Secret: "+append+"__");
                                     });
                    }
                } else if(!args[1]){
                    msg.channel.send("__Missing arguments!__");
                } else {
                    msg.channel.send("__Argument: "+ args[1] +" is inavlid!__");
                }
            //} else if(args[0] == "purge"){
                //append = createChannelPurge(msg);
                //msg.channel.send("__Channel Timed Purge: "+append+"__");
            } else {
                msg.channel.send("__Command "+ arg +", does not exist!__");
            }
            
        }

}

//getCommID - Uses Twitch api v5 (Kraken) to get the community_id from community name
function getCommID (channel, client_id, comm, callback) {
    //console.log("Debug: Ajax script getCommID function\n"); //Debug code testing not caught in if statement
    $.ajax({
           url: 'https://api.twitch.tv/kraken/communities?name=' + comm,
           beforeSend: function(xhr) {
                xhr.setRequestHeader("Client-ID", client_id);
                xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
           },
           type: 'GET',
           dataType: 'json',
           contentType: 'application/json',
           success: function(resp){ var data = resp; callback(data);},
           error: function(err){
           console.log("Error has occured at getComm: "+ err+"\n");
           callback();
           }
           });
}

function getAccessKey(client, secret, callback) {
    console.log('getAccessKey client: '+client);
    $.ajax({
           url: 'https://api.twitch.tv/kraken/oauth2/token?client_id='+client+'&client_secret='+secret+'&grant_type=client_credentials&scope=user:read:email',
           //beforeSend: function(xhr) {
           //xhr.setRequestHeader("Client-ID", client_id);
           //xhr.setRequestHeader("Accept", "application/vnd.twitchtv.v5+json");
           //},
           type: 'POST',
           dataType: 'json',
           contentType: 'application/x-www-form-urlencode',
           success: function(resp){ var data = resp; console.log('In success: '+JSON.stringify(data,null,2)); callback(data);},
           error: function(err){
           console.log("Error has occured at getAccessKey: "+ JSON.stringify(err,null,2)+"\n");
           callback();
           }
           });
}

function getStreams(commid,client,msg,pagination){
    var data;
    var response = {}; //Object initilization
    var pagination; //undefined only used to make the rest of the function happy
    
    if(pagination == null){ //Null throws an error on twitch api, so we set it to a blank.
    pagination = "";
    }

    $.ajax({
           url: 'https://api.twitch.tv/helix/streams?community_id=' + commid +'&first=8&after='+pagination,
           beforeSend: function(xhr) {
           xhr.setRequestHeader("Client-ID", client);
           },
           method: 'GET',
           dataType: 'json',
           //data: JSON.parse(data), //Don't know if this helped at all or not.
           contentType: 'application/json',
           success: function(resp){ //console.log('in success state: getStreams-ajax'); // more debug code when troubleshooting why ajax was having issues
           var datas = resp;
           pagination = datas.pagination.cursor;
           if(typeof datas.pagination.cursor == 'undefined'){ return;
           } else {
           //Takes the data from ajax and makes it into a string
           var dat_string = JSON.stringify(datas,null);
           //Parses after being made into a string (Doesn't like what ajax spits out)
           var parsed = JSON.parse(dat_string);
           var dat_parse = parsed.data; //Shorten the variable needed to be used (dat_parsed ~= parsed.data)
           var result = []; //initialize variable containing the array for the culling
           for (var i= 0; i < dat_parse.length; i++) {
           var obj_ind = dat_parse[i];
           var user_id = obj_ind.user_id;
           var type = obj_ind.type;
           result.push({'user_id':user_id,'type':type});
           }
           Stream_data = {'data':result};
           
           getUserNames(Stream_data,client,msg); //Sends off to get more information to make the multistre.am link
           getStreams(commid,client,msg,pagination); //Calls current function with Pagination to being up next grouping of results (if there are any)
           }},
           error: function(err){
           console.log("Error has occured at getStreams: "+ JSON.stringify(err,null,2)+"\n");
           }
           });
}

function getUserNames(data,client,msg){
    var Bearer = require('../../guilds/'+msg.guild.name+'.json').bearer;
    var id = "";
    var response = [];
    id = data.data[0].user_id;
    for(var i = 1; i < data.data.length; i++){
        id += "&id="+data.data[i].user_id;
    }
    
    $.ajax({
           url: 'https://api.twitch.tv/helix/users?id=' + id,
           beforeSend: function(xhr) {
           xhr.setRequestHeader("Client-ID", client);
           xhr.setRequestHeader("Authorization","Bearer "+Bearer);
           },
           type: 'GET',
           dataType: 'json',
           contentType: 'application/json',
           success: function(resp){
           datas = resp;
           
           var dat_string = JSON.stringify(datas,null);
           //Parses after being made into a string (Doesn't like what ajax spits out)
           var parsed = JSON.parse(dat_string);
           var dat_parse = parsed.data; //Shorten the variable needed to be used (dat_parsed ~= parsed.data)
           var result = []; //initialize variable containing the array for the culling
           
           //culls information we don't need (id, profile pic, game, info, description, ect.)
           for (var i= 0; i < dat_parse.length; i++) {
           var obj_ind = dat_parse[i];
           var user_id = obj_ind.display_name;
           response.push({'name':user_id});
           }
           
           User_data = {'data':response,'link':'Link '+link_count};
           formatLink(User_data,msg);
           link_count +=1;
           },
           error: function(err){
           console.log("Error has occured at getUserNames: "+ err+"\n");
           }
           });
}

function formatLink(stream,msg){
    //console.log("Attempt to format: formatLink");
    var baseurl = "http://multistre.am/";
    for(var i = 0; i < stream.data.length; i++){
        baseurl += stream.data[i].name+'/';
    }
    msg.channel.send("**"+ stream.link +" "+baseurl+" ** @everyone");
    //console.log("Length of 'Streamers': "+User_data.length);    
}

//Used to append new information to [guild].json file
function appendJSON (community,client,secret,access,commid,msg){
    var Up_Rec = require("../../guilds/"+ msg.guild.name +".json");
    if (client != null){
        Up_Rec.client_id = client;
    }
    if(secret != null){
        Up_Rec.secret = secret;
    }
    if(access != null){
        Up_Rec.bearer = access;
    }
    if (community != null){
        Up_Rec.community = community;
    }
    if (commid != null){
        Up_Rec.commid = commid;
    }
    try{
        if(fs.lstatSync("./guilds/"+ msg.guild.name +".json").isFile()){
            console.log("WARNING: "+msg.guild.name+".json found but we couldn't read it!\n" + e.stack);
            return "Failed!";
        }
    } catch(e2){
        if (!fs.writeFile("./guilds/"+ msg.guild.name +".json",JSON.stringify(Up_Rec,null,2))){
            return "Success!";
        }
        return "Failed!";
    }
}

exports.MTP = {
    ussage: "add or rm",
    description: "add or remove a channel from a timed purge of 15 minute or older messages __**MuST BE RAN FROM CHANNEL YOU WANT ADDED**__",
    process: function(bot,msg,arg){
        var args = arg;
        var append;
        if (args == "add"){
            append = createChannelPurge(msg);
            msg.channel.send("__Add Channel to Purge: "+append+"__");
        }else if(args == "rm"){
            append = deleteChannelPurge(msg);
            msg.channel.send("__Remove Channel from Purge: "+append+"__");
        }
}
}
function createChannelPurge(msg){
    var channelObj = msg.channel;
    var guildName = msg.guild.name;
    var Up_Rec = require("../../guilds/"+guildName+".json");
    var purge = [];
    //console.log('Purge type: '+typeof Up_Rec.purge);
    if(typeof Up_Rec.purge != 'undefined' && Up_Rec.purge != ""){
        //console.log(JSON.stringify(Up_Rec.purge,null,2));
        //var tmp = JSON.stringify(Up_Rec.purge);
        //Up_Rec.purge = [];
        //console.log('length of purge: '+Up_Rec.purge.length);
        for(let meh of Up_Rec.purge){
            if(msg.channel.name != meh.channel){
                purge.push(meh);
            }
        }
        purge.push({'channel':msg.channel.name});
        Up_Rec.purge = purge;
    }else{
        Up_Rec.purge = [{'channel':msg.channel.name}];
    }
    
    try{
        if(fs.lstatSync("./guilds/"+ guildName +".json").isFile()){
            console.log("WARNING: "+guildName+".json found but we couldn't read it!\n" + e.stack);
            return "Failed!";
        }
    } catch(e2){
        if (!fs.writeFile("./guilds/"+ guildName +".json",JSON.stringify(Up_Rec,null,2))){
            return "Success!";
        }
        return "Failed!";
    }
}

function deleteChannelPurge(msg){
    var channelObj = msg.channel;
    var guildName = msg.guild.name;
    var Up_Rec = require("../../guilds/"+guildName+".json");
    var purge = [];
    //console.log('Purge type: '+typeof Up_Rec.purge);
    if(typeof Up_Rec.purge != 'undefined' && Up_Rec.purge != ""){
        //console.log(JSON.stringify(Up_Rec.purge,null,2));
        //var tmp = JSON.stringify(Up_Rec.purge);
        //Up_Rec.purge = [];
        //console.log('length of purge: '+Up_Rec.purge.length);
        for(let meh of Up_Rec.purge){
            if(msg.channel.name != meh.channel){
                purge.push(meh);
            }
        }
        //purge.push({'channel':msg.channel.name});
        Up_Rec.purge = purge;
    }else{
        delete Up_Rec.purge;
    }
    
    try{
        if(fs.lstatSync("./guilds/"+ guildName +".json").isFile()){
            console.log("WARNING: "+guildName+".json found but we couldn't read it!\n" + e.stack);
            return "Failed!";
        }
    } catch(e2){
        if (!fs.writeFile("./guilds/"+ guildName +".json",JSON.stringify(Up_Rec,null,2))){
            return "Success!";
        }
        return "Failed!";
    }
}
