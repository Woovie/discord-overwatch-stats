/*
Watcher.gg stats bot for Overwatch

Initial version by dbkynd which scraped playeroverwatch.com manually
Github here: https://github.com/dbkynd/discord-overwatch-stats

Forked by Woovie to work with watcher.gg API https://api.watcher.gg/players/pc/us/woovie%231582
Github here: https://github.com/Woovie/discord-overwatch-stats
draft build
Anything marked with //*** is merely for testing different ideas and may be removed later.
*/

"use strict";
const Discord = require ("discord.js"),
request = require ("request");
const https = require ("https");//***
const sleep = require ("sleep");//***

//Discord variables
var discord = new Discord.Client();
discord.loginWithToken (""); //Login using a Discord 'BOT' account token

//Overwatch specific variables
var overwatch_prefix = "!ow";
var base_url = "watcher.gg/players/pc/";
var api_prefix = "https://api.";
var pub_prefix = "https://";
var regions = ["us", "eu", "kr"];
var region;
var tag;
var final_url;
var urls_checked = 0;//***

//Handle incoming message
function discordMessage (message) {
    if (message.author.id == discord.user.id) return;
    if (!message.content.startsWith(overwatch_prefix)) return;
    tag = message.content.substring(overwatch_prefix.length, message.length).trim();
    if (tag == "") { return tagError(message, -1) };
    var region_url = api_prefix + base_url;
    for (var i=0; i<regions.length; i++) {
        var test_url = region_url + regions[i] + "/" + tag.replace ("#", "%23");
        https.get (test_url, function (response) {//***
            if (response.statusCode === 200) {
                processRegionURL (test_url);

            }
            urls_checked++;//***
        })
    }
    while (urls_checked != 3) {//***

    }
    return processUser (message);
}

function processUser (message) {
    if (final_url) {
        discord.sendMessage (message, "Start of a found user to process " + final_url);
    } else {
        tagError (message, 1);
    }
}

//Region found
function processRegionURL (test_url) {//***
    final_url = test_url;
}

//Overwatch error with tag
function tagError (message, err) {
    if (err == -1) {
        discord.sendMessage (message, "Please ensure you included a battletag, no battletag was found.");
    } else if (err == 1) {
        discord.sendMessage (message, "No user found by the battletag **" + tag + "**, please check the spelling.");
    }
}

//Overwatch events
discord.on ('ready', discordReady);
discord.on ('message', discordMessage);
