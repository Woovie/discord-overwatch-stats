# Discord Overwatch Stats
Show rank and time played on top heroes in Discord Chat

Scrapes the https://playoverwatch.com/ site for statistics.

1. Install node.js and make sure it is available via PATH
2. Run ``npm install`` in the same folder as package.json
3. Enter your credentials into app.js. Either a bot token or email and password. (Only use 1 method)
4. Run ``node app.js``
5. In a Discord channel the bot can read and post in, run ``!ow name#id``

Caveats: only works currenty for /us/pc/
