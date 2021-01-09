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



bot.on('message', function (user, userID, channelID, message, evt) {


    if (message.substring(0, 1) === prefix ){

        let path = "tmp/bind.txt"; //path where channel id is saved
        let bind;
        let args = message.substring(1).split(" ");
        let cmd = args[0];
        args = args.splice(1);
        switch (cmd){
            case "submission":

                    if (fs.existsSync(path)) { //check if file exists
                        fs.readFile(path, 'utf8', function(err, data) {
                            if (err) throw err;
                            bind = data; //read channelID from file
                            say(bind, `https://discord.com/channels/${evt.d.guild_id}/${evt.d.channel_id}/${evt.d.id}`);
                            say(channelID, "submission completed!");
                        });
                    }
                    else {
                        say(channelID, "Error: I am not bound to any channel yet! use $bind to define the output channel.")
                    }
                break;
            case "bind":
                fs.writeFile(path, channelID, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("The file was saved.");
                    say(channelID, `RecordBot will now send submissions to <#${channelID}>`);
                });
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