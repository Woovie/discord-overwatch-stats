/*
Watcher.gg stats bot for Overwatch
Initial version by dbkynd which scraped playeroverwatch.com manually
Github here: https://github.com/dbkynd/discord-overwatch-stats
Forked by Woovie to work with watcher.gg API https://api.watcher.gg/players/pc/us/woovie%231582
Github here: https://github.com/Woovie/discord-overwatch-stats
*/

"use strict";
const Discord = require ("discord.js"),
request = require('sync-request');

//
// Variables
//

//Discord specific variables
var discord = new Discord.Client({
    autoReconnect: true //Reconnect if there's a failure
});
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
var player_data;
var player = [];

//
// Functions
//

//Function for the discord ready event
function discordReady () {
    console.log ("Successful connection to Discord as '" + discord.user.username + "'");
    discord.setPlayingGame ("watcherbot.net");
}

//Round to the 0.000 value
function round000(number) {
    return (Math.round(number * 1000) / 1000);
}

//Add 000,000,000 commas
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Function for the discord message event
function discordMessage (message) {
    final_url = false;
    player_data = false;
    region = false;
    tag = false;
    if (message.author.id == discord.user.id) return;
    if (!message.content.startsWith(overwatch_prefix)) return;
    tag = message.content.substring(overwatch_prefix.length, message.length).trim();
    if (tag == "") { return tagError(message, -1) };
    var region_url = api_prefix + base_url;
    for (var i=0; i<regions.length; i++) {
        var test_url = region_url + regions[i] + "/" + tag.replace ("#", "%23");
        var results = request('GET', test_url);
        if (results.statusCode == 200) {
            player_data = JSON.parse(results.getBody());
            final_url = test_url;
            region = regions[i];
        }
    }
    setupUser (message);
}

//Generate player statistics into easy to use variables
function setupUser (message) {
    if (final_url) {
        player.level = player_data.data.player.level;
        player.lastUpdated = player_data.data.player.lastUpdated;
        player.score = player_data.data.heroStats[0].score;
        player.timePlayed = player_data.data.heroStats[0].timePlayed;
        player.scorePerSecond = round000 (player.score / player.timePlayed);
        player.timePlayedHours = player.timePlayed / 3600;
        player.heroes = [];
        player.heroes.sortedByScore = [];
        for (let i=0; i < player_data.data.heroStats.length; i++) {
            if (player_data.data.heroStats[i].score == 0) { continue };
            if (player_data.data.heroStats[i].id == -1) { continue };
            player.heroes.sortedByScore.push(player_data.data.heroStats[i]);
        }
        player.heroes.sortedByScore.sort(function(a,b){return b.score-a.score});
        if (player_data.data.ranks[0].ranks.averageScore == -1) { player.scoreRank = "Unranked" } else { player.scoreRank = "#" + numberWithCommas(player_data.data.ranks[0].ranks.averageScore) };
        setupOutput (message);
    } else {
        tagError (message, 1);
    }
}

//Output to Discord, this needs cleanup badly.
function setupOutput (message) {
    var str = "Watcher.gg Stats for **" + tag + "** found for region **" + region.toUpperCase() + "** last updated on " + player.lastUpdated + "\n";
    str += "**Level:** " + player.level + " **Total Score:** " + numberWithCommas(player.score) + " **Time Played:** ~" + player.timePlayedHours + " hours\n";
    str += "**Score/sec:** " + player.scorePerSecond + " **Rank:** "  + player.scoreRank + "\n";
    if (player.heroes.sortedByScore.length >= 3) {
        str += "**Top 3 Heroes by Total Score:**\n";
        for (let i=0;i < 3; i++) {
            str += "**" + (Number(i) + 1) + ".** " + player.heroes.sortedByScore[i].name + " **Score:** " + numberWithCommas(player.heroes.sortedByScore[i].score);
            for (let j=0;j < player_data.data.ranks.length; j++) {
                if (player_data.data.ranks[j].id == player.heroes.sortedByScore[i].id) {
                    if (player_data.data.ranks[j].ranks.averageScore != -1) { str += " **Rank** #" + numberWithCommas(player_data.data.ranks[j].ranks.averageScore)};
                };
            };
        str += "\n";
        };
    };
    str += "\nView the full page here: " + pub_prefix + base_url + region + "/" + tag.replace ("#", "%23");
    return discord.sendMessage ( message, str );
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
