# Discord Overwatch Stats
Show rank and time played on top heroes in Discord Chat

Scrapes the https://watcher.gg/ JSON API for statistics.

1. Install node.js and make sure it is available via PATH
2. Run ``npm install`` in the same folder as package.json
3. Enter your credentials into app.js. Either a bot token or email and password. (Only use 1 method)
4. Run ``node app.js``
5. In a Discord channel the bot can read and post in, run ``!ow name#id``

Caveats: only works currenty for /us/pc/

This is a fork of https://github.com/dbkynd/discord-overwatch-stats and I'd like to thank dbkynd for a starting point and idea.
