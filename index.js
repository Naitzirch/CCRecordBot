const Discord = require('discord.io');
const low = require('lowdb');
const fs = require('fs');
const FileSync = require('lowdb/adapters/FileSync');

let prefix = "$";
const bot = new Discord.Client({
    token: "Nzk3MTY1NTcwOTMxOTQ5NTcy.X_igSg.3mXyoZF-xmUjQf013dIpQPREkIA",
    autorun: true
});

bot.on("ready", function (){
    console.log("Bot started, logged in as: " + bot.username);
});




bot.on('message', function (user, userID, channelID, message, evt, url) {


    if (message.substring(0, 1) === prefix ){

        let args = message.substring(1).split(" ");
        let cmd = args[0];
        args = args.splice(1);
        switch (cmd){
            case "submission":
                say(channelID, `https://discord.com/channels/${evt.d.guild_id}/${evt.d.channel_id}/${evt.d.id}`);
                say(channelID, "submission completed!");
                break;
            case "bind":
                say(channelID, "RecordsBot will now send submissions to ", );
                break;
            case "help":
                say(channelID, "Help message");
                break;
        }
    }
});

function say(channelID, message){
    bot.sendMessage({
        to: channelID,
        message: message
    });
}