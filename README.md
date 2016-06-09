# Discord Overwatch Stats
Displays various stats about a player including score rank, total score, time played, score/sec, and top 3 hero stats based on score.
Scrapes https://watcher.gg/ JSON API for statistics.

If you want to use this bot on your server without the need to host it yourself, you can use this invite URL: https://discordapp.com/oauth2/authorize?client_id=187656769567326217&scope=bot&permissions=0

#Install

1. Install node.js and make sure it is available via PATH
2. Run ``npm install`` in the same folder as package.json
3. Input a bot token from Discord API. (See https://discordapp.com/developers/applications/me to create your app, ensure you also click Create a Bot User)
4. Run ``node app.js``
5. In a Discord channel the bot can read and post in, run ``!ow name#id``

#To-do list
Got a request? Comment and I'll be glad to look into it!

- [*] Redo URL building and URI encoding in a cleaner manner for region support.
- [*] Allow EU or KR to use search (Do a loop through regions, searching the ID, until the result is a 200)
- [ ] Add a way to somehow detect Cloudflare's error page since it returns a 200 OK.
- [ ] Add character specific search to give an outline of all stats for that specific character

#Credits

This is a fork of https://github.com/dbkynd/discord-overwatch-stats and I'd like to thank dbkynd for a starting point and idea.
