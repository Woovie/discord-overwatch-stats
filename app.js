/*
Watcher.gg stats bot for Overwatch

Initial version by dbkynd which scraped playeroverwatch.com manually
Github here: https://github.com/dbkynd/discord-overwatch-stats

Forked by Woovie to work with watcher.gg API https://api.watcher.gg/players/pc/us/woovie%231582
Github here: https://github.com/Woovie/discord-overwatch-stats
*/

'use strict';
const Discord = require('discord.js'),
request = require("request");

//Global variables
var discord = new Discord.Client();
discord.loginWithToken(""); //Login using a Discord 'BOT' account token

//Overwatch specific variables
var overwatch_prefix = "!ow";

//Global functions
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round000(number) {
    return (Math.round(number * 1000) / 1000);
}

discord.on('ready', () => { //The discord client has connected
    console.log("Successful connection to Discord as '" + discord.user.username + "'");
    discord.setPlayingGame("watcherbot.net")
});

//Overwatch stats function
discord.on('message', (message) => {
    if (message.author.id == discord.user.id) return;
    if (!message.content.startsWith(overwatch_prefix)) return;
    let tag = message.content.substring(overwatch_prefix.length, message.length).trim();
    if (tag == "") return discord.sendMessage(message, "``" + overwatch_prefix + " name#id``");
    let url = encodeURI("https://api.watcher.gg/players/pc/us/" + tag).replace("#", "%23");
    let url_pub = encodeURI("https://watcher.gg/profile/pc/us/" + tag).replace("#", "%23");
    let name = tag.split('#')[0];
    request.get(url, function (err, res, body) {
        let data = JSON.parse(body);
        let code = data.statusCode;
        if ( code != 200 ) {
            return discord.sendMessage(message, "Error getting stats for ``" + name + "``");
        } else {
            let player = [];
            player.level = data.data.player.level;
            player.lastUpdated = data.data.player.lastUpdated;
            player.score = data.data.heroStats[0].score;
            player.timePlayed = data.data.heroStats[0].timePlayed;
            player.scorePerSecond = player.score / player.timePlayed;
            player.timePlayedHours = player.timePlayed / 3600;
            player.heroes = [];
            player.heroes.sortedByScore = [];
            for (let i=0; i < data.data.heroStats.length; i++) {
                if (data.data.heroStats[i].score == 0) { continue };
                if (data.data.heroStats[i].id == -1) { continue };
                player.heroes.sortedByScore.push(data.data.heroStats[i]);
            }
            player.heroes.sortedByScore.sort(function(a,b){return b.score-a.score});
            if (data.data.ranks[0].ranks.averageScore == -1) { player.scoreRank = "Unranked" } else { player.scoreRank = "#" + numberWithCommas(data.data.ranks[0].ranks.averageScore) };
            let str = "Watcher.gg Stats for **" + tag + "** last updated on " + player.lastUpdated + "\n";
            str += "**Score/sec:** " + round000(player.scorePerSecond) + " **Rank:** "  + player.scoreRank + "\n";
            str += "**Total Score:** " + numberWithCommas(player.score) + " **Total Time Played:** ~" + player.timePlayedHours + " hours\n";
            if (player.heroes.sortedByScore.length >= 3) {
                str += "**Top 3 Heroes by Total Score:**\n";
                for (let i=0;i < 3; i++) {
                    str += "**" + (Number(i) + 1) + ".** " + player.heroes.sortedByScore[i].name + " **Score:** " + numberWithCommas(player.heroes.sortedByScore[i].score);
                    for (let j=0;j < data.data.ranks.length; j++) {
                        if (data.data.ranks[j].id == player.heroes.sortedByScore[i].id) {
                            if (data.data.ranks[j].ranks.averageScore != -1) { str += " **Rank** #" + numberWithCommas(data.data.ranks[j].ranks.averageScore)};
                        };
                    };
                    str += "\n";
                };
            };
            str += "\nView the full page here: " + url_pub;
            return discord.sendMessage ( message, str );
        }
    });
});
