//Main file
//Author: Christian Martens
//Last update: 10/01/2021
//version 1.1

const Discord = require('discord.io');
const low = require('lowdb');
const fs = require('fs');
const FileSync = require('lowdb/adapters/FileSync');

let prefix = "$";
const bot = new Discord.Client({
    token: "Nzk3ODc3MjI5MDczNDY1NDY1.X_s3Ew.Xpx9BM8_ZE2IsLnFkle6r0BjQUw", //DONT USE THE SAME TOKEN AFTER DEPLOYMENT
    autorun: true
});

bot.on("ready", function () {
    console.log("Bot started, logged in as: " + bot.username);
});


bot.on('message', function (user, userID, channelID, message, evt) {


    if (message.substring(0, 1) === prefix) {

        let badUsage;

        let path = "tmp/bind.txt"; //path where channel id is saved
        let bind;
        let args = message.substring(1).split(/[ \n]/);
        let cmd = args[0];
        args = args.splice(1);
        switch (cmd) {
            case "submit":

                if (fs.existsSync(path)) { //check if file exists
                    fs.readFile(path, 'utf8', function (err, data) {
                        if (err) throw err;
                        bind = data; //read channelID from file
                        //say(bind, ``);

                        if (args.length > 2) {

                            let IGN = args[0]; //first element is IGN
                            args = args.splice(1); //remove IGN from array

                            let linkIndex;
                            let argsValue;
                            let cubeCraftLink = "https://www.cubecraft.net/members/"
                            //check at what index the element has a substring of cubeCraftLink
                            for (linkIndex = 1; linkIndex < args.length; ++linkIndex){
                                argsValue = args[linkIndex];
                                if (argsValue.substring(0,cubeCraftLink.length) === cubeCraftLink) {
                                    badUsage = false;
                                    break; //stop when you've got the index of the link
                                } else {
                                    badUsage = true;
                                }
                            }

                            if (badUsage){
                                say(channelID, "Make sure to include the link to your forums profile!");
                                return;
                            }

                            let forumLink = args[linkIndex];

                            let GM = args.splice(0, linkIndex); //Get all the words upto the forum link and remove them from args
                            GM = GM.join(" ");
                            args = args.splice(1); //remove forums link from args
                            message = args.join(" "); //join the rest of args as the message
                            bot.sendMessage({
                                to: bind,
                                message: '',
                                embed: {
                                    color: 0xfecc52,
                                    title: `New submission by ${evt.d.author.username}`,
                                    fields: [{
                                        name: "Details",
                                        value: `IGN: **${IGN}**\n` +
                                            `Game-mode: **${GM}**\n` +
                                            `[${evt.d.author.username}'s forums profile](${forumLink})\n\n`

                                    },
                                        {
                                            name: "Message:",
                                            value: message +
                                                `\n\n[**Click here to view their submission**](https://discord.com/channels/${evt.d.guild_id}/${evt.d.channel_id}/${evt.d.id})`
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: "Don't forget to delete this message after reviewing!"
                                    }
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
            case "link":
                bot.sendMessage({
                    to: channelID,
                    message: '',
                    embed: {
                        title: "CubeCraft Book of World Records",
                        url: "https://www.cubecraft.net/threads/cubecraft-book-of-world-records-revamping.213611/"
                    }
                })
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

                                "$submit [IGN] [Game-mode] [forum profile link] [Your message] [evidence]\n" +
                                "- Submit your record! \n\n" +
                                "Example of usage:\n" +
                                "`$submit rubik_cube_man Parkour https://www.cubecraft.net/members/rubik_cube_man.5/ " +
                                "\nFastest time Barn 1 5:232s [evidence]`\n\n" +

                                "$link\n" +
                                "- Sends a link to the CCG Records Thread."


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