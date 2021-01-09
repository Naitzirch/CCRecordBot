const Discord = require('discord.io');
const low = require('lowdb');
const fs = require('fs');
const FileSync = require('lowdb/adapters/FileSync');

let prefix = "$";
const bot = new Discord.Client({
    token: "Nzk3MTY1NTcwOTMxOTQ5NTcy.X_igSg.3mXyoZF-xmUjQf013dIpQPREkIA", //DONT USE THE SAME TOKEN AFTER DEPLOYMENT
    autorun: true
});

bot.on("ready", function () {
    console.log("Bot started, logged in as: " + bot.username);
});


bot.on('message', function (user, userID, channelID, message, evt) {


    if (message.substring(0, 1) === prefix) {

        let path = "tmp/bind.txt"; //path where channel id is saved
        let bind;
        let args = message.substring(1).split(" ");
        let cmd = args[0];
        args = args.splice(1);
        //console.log(args);
        switch (cmd) {
            case "submit":

                if (fs.existsSync(path)) { //check if file exists
                    fs.readFile(path, 'utf8', function (err, data) {
                        if (err) throw err;
                        bind = data; //read channelID from file
                        //say(bind, ``);

                        if (args.length > 1) {

                            let IGN = args[0];
                            let GM = args[1];
                            args.splice(0, 2);
                            message = args.join(" ");
                            bot.sendMessage({
                                to: bind,
                                message: '',
                                embed: {
                                    color: 0xfecc52,
                                    title: `New submission by ${evt.d.author.username}`,
                                    fields: [{
                                        name: "Details",
                                        value: `IGN: **${IGN}**\n` +
                                            `Game-mode: **${GM}**\n\n`
                                    },
                                        {
                                            name: "Message:",
                                            value: message +
                                                `\n\n[**Click here to view their submission**](https://discord.com/channels/${evt.d.guild_id}/${evt.d.channel_id}/${evt.d.id})`
                                        }
                                    ]
                                }
                            });
                            say(channelID, `Your submission will be reviewed! <@${userID}>`);
                        } else {
                            say(channelID, "Not enough arguments. Use `$help` to see proper usage.");
                        }
                    });
                } else {
                    say(channelID, "Error: I am not bound to any channel yet! use $bind to define the output channel.")
                }
                break;
            case "bind": //save a file with the channelID
                let roleArr = evt.d.member.roles; //check what roles the user has
                let rolePath = "tmp/role.txt";

                if (fs.existsSync(rolePath)) { //check if role file exists
                    fs.readFile(rolePath, 'utf8', function (err, savedRole) {
                        if (err) throw err;

                        //check if the querying user has the role
                        if (roleArr.includes(savedRole) || savedRole === "undefined") {
                            if (typeof args[0] !== 'undefined') { //Check if there is an argument

                                let role = args[0].substring(3, args[0].length - 1);

                                fs.writeFile(rolePath, role, function (err) { //save their role id
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log("The file was saved.");
                                    say(channelID, `Only <@&${role}> will now be able to use the bind command.`);
                                });
                            } else {
                                fs.writeFile(path, channelID, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log("The file was saved.");
                                    say(channelID, `RecordBot will now send submissions to <#${channelID}>`);
                                });
                            }
                        } else {
                            say(channelID, "You do not have permission to use this command.");
                        }
                    });
                }
                break;
            case "help":
                bot.sendMessage({
                    to: channelID,
                    message: '',
                    embed: {
                        color: 0xfecc52,
                        title: 'RecordBot help',
                        //url: 'https://cubecraft.net'
                        description:
                            "[**CubeCraft Book of World Records**](https://www.cubecraft.net/threads/cubecraft-book-of-world-records-revamping.213611/)" +
                            "\nThis is where your records are displayed after they have been reviewed and accepted.\n\n",
                        fields: [{
                            name: "Commands",
                            value: "$help\n" +
                                "- Displays this information panel.\n\n" +

                                "$submit [IGN] [Game-mode] [Your message] [evidence]\n" +
                                "- Submit your record! \n" +
                                "Example of usage:\n" +
                                "`$submit rubik_cube_man Parkour Fastest time Barn 1 5:232s [evidence]`\n\n"


                        } //You can put [masked links](http://google.com) inside of rich embeds.

                        ],
                        footer: {
                            text: ''
                        }
                    }
                })
                break;
        }
    }
});

function say(channelID, message) {
    bot.sendMessage({
        to: channelID,
        message: message
    });
}