'use strict';
const Discord = require('discord.js'), //Discord module
    request = require("request");

var discord = new Discord.Client(); //New discord client
var trigger_prefix = "!ow";

discord.loginWithToken(""); //Login using a Discord 'BOT' account token

discord.on('ready', () => { //The discord client has connected
    console.log("Successful connection to Discord as '" + discord.user.username + "'");
});

discord.on('message', (message) => { //A message was sent in a Discord channel
    if (message.author.id == discord.user.id) return; //Exit if message is from self(bot)
    if (!message.content.startsWith(trigger_prefix)) return; //Exit if the message doesn't start with our trigger word
    let tag = message.content.substring(trigger_prefix.length, message.length).trim(); //Remove trigger prefix and remove space
    if (tag == "") return discord.sendMessage(message, "``" + trigger_prefix + " name#id``"); //Show usage if no name is passed
    let url = encodeURI("https://api.watcher.gg/players/pc/us/" + tag).replace("#", "%23"); //URL for grabbing player data from API
    let url_pub = encodeURI("https://watcher.gg/profile/pc/us/" + tag).replace("#", "%23"); //URL for public linking
    let name = tag.split('#')[0]; //Get name from tag for messages
    request.get(url, function (err, res, body) { //Get the URL contents
        let data = JSON.parse(body); //Parse the contents to a JSON table
        let code = data.statusCode; //Get the status code for error checking
        if ( code != 200 ) { //If we get something other than a 200 OK
            return discord.sendMessage(message, "Error getting stats for ``" + name + "``");
        } else {
            let str = "Watcher.gg Stats for " + tag + "\n";
            str += "```Score/sec: " + String ( Math.round ( data.data.heroStats[0].score / data.data.heroStats[0].timePlayed * 1000 ) / 1000 ) + " Rank: #"  + numberWithCommas ( data.data.ranks[0].ranks.averageScore ) + "\n"; //Calculate score per second and display player rank overall for US
            str += "Total Score: " + numberWithCommas ( data.data.heroStats[0].score ) + " Total Time Played: ~" + data.data.heroStats[0].timePlayed/60/60 + " hours\n"; //Display raw score and hours played
            str += "View the full page here: " + url_pub; //Send a URL at the end to the watcher.gg page of this player
            return discord.sendMessage ( message, str );
        }
    });
});
function numberWithCommas(number) { //This function turns 999999999 into 999,999,999
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
