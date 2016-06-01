'use strict';
const Discord = require('discord.js'), //Discord module
    cheerio = require("cheerio"),
    request = require("request");

var discord = new Discord.Client(); //New discord client
var trigger_prefix = "!ow";
var heroes_to_display = 5;

discord.loginWithToken("token"); //Login using a Discord 'BOT' account token
//discord.login("email", "password"); //Login with a normal user account

discord.on('ready', () => { //The discord client has connected
    console.log("Successful connection to Discord as '" + discord.user.username + "'");
});

discord.on('message', (message) => { //A message was sent in a Discord channel
    if (message.author.id == discord.user.id) return; //Exit if message is from self(bot)
    if (!message.content.startsWith(trigger_prefix)) return; //Exit if the message doesn't start with our trigger word
    let tag = message.content.substring(trigger_prefix.length, message.length).replace('#', '-'); //Remove trigger prefix and replace hash with hyphen
    if (tag == "") return discord.sendMessage(message, "``" + trigger_prefix + " name#id``"); //Show usage if no name is passed
    let url = encodeURI("https://playoverwatch.com/en-us/career/pc/us/" + tag + "/"); //TODO: handle other regions
    let name = tag.split('-')[0]; //Get name from tag for messages
    request.get({url: url}, (err, res, body) => { //Get HTML
        if (err || res.statusCode != 200) return discord.sendMessage(message, "Error getting stats for ``" + name + "``");
        let $ = cheerio.load(body); //Load HTML string as jQuery object
        let data = []; //List to hold hero data
        let rank = $('.player-level').text(); //Scraped player rank
        let heroes = $('.progress-category')[0]; //Gets first set of drop down hero data (Time Played)
        for (let i = 0; i < heroes_to_display; i++) {
            let hero = $(heroes).children()[i]; //Gets hero data row
            let name = $(hero).find('.title').text(); //Scrapes hero name
            let time = $(hero).find('.description').text(); //Scrapes time played
            data.push({name: name, time: time}); //Pushes hero to data list
        }
        let str = "```" + name + (name.endsWith("s") ? "'" : "'s") + " Overwatch level is: " + rank + ". Top heroes are: ```"; //Top line
        for (let i = 0; i < data.length; i++) {
            str += "\n``" + (i + 1) + ".``**" + data[i].name + "** - " + data[i].time; //Enumerated stats
        }
        discord.sendMessage(message, str);
    });
});
