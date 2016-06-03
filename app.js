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
discord.loginWithToken("MTg3NjU2ODU5NzUzMjUwODE3.CjDQkg.tgkYufbspBUsDs2T89ym7bKNLRU"); //Login using a Discord 'BOT' account token

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
            player.scoreRank = data.data.ranks[0].ranks.averageScore;
            player.timePlayedHours = player.timePlayed / 3600;
            let str = "Watcher.gg Stats for **" + tag + "**\n";
            str += "**Score/sec:** " + round000(player.scorePerSecond) + " **Rank:** #"  + numberWithCommas(player.scoreRank) + "\n";
            str += "**Total Score:** " + numberWithCommas(player.score) + " **Total Time Played:** ~" + player.timePlayedHours + " hours\n";
            str += "View the full page here: " + url_pub;
            return discord.sendMessage ( message, str );
        }
    });
});
