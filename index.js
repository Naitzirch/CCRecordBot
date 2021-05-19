//Main file
//Author: Christian Martens
//Last update: 17/03/2021
//version 1.3

const Discord = require('discord.io');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json')
const db = low(adapter)

//const fs = require('fs');

db.defaults({ botInfo: {}, help: [] , users: []})
    .write()


const bot = new Discord.Client({
    token: db.get('botInfo.token').value(), //Read the bot token from the db
    autorun: true
});
bot.on("ready", function () {
    console.log("Bot started, logged in as: " + bot.username);
});

let prefix = "$";


bot.on('message', function (user, userID, channelID, message, evt) {


    if (message.substring(0, 1) === prefix) {

        if (message.substring(1, 4) === "say") {
            let args = message.substring(1).split(" ");
            console.log(args);
            args = args.splice(1);
            console.log(args);
            let channel = args[0].substring(2, args[0].length - 1);
            args = args.splice(1);
            let content = args.join(" ");
            console.log(channel);
            console.log(content);
            say(channel, content);
            return;
        }

        let badUsage;

        let bind;
        let args = message.substring(1).split(/[ \n]/);
        let cmd = args[0];
        args = args.splice(1);
        switch (cmd) {
            case "Submit":
            case "submit":
                if (db.get('botInfo.channelID').value()){
                    bind = db.get('botInfo.channelID').value(); //read channelID from db
                } else {
                    say(channelID, "Error: I am not bound to any channel yet! use $bind to define the output channel.");
                    return;
                }


                let IGN
                let forumLink
                let GM

                if (db.get('users').find({id: userID}).value()){
                    IGN = db.get('users').find({id: userID}).value().IGN;
                    forumLink = db.get('users').find({id: userID}).value().forums;
                    GM = args[0];
                    args = args.splice(1);
                    message = args.join(" ");
                } else if (args.length > 2) {

                    IGN = args[0]; //first element is IGN
                    args = args.splice(1); //remove IGN from array

                    let linkIndex;
                    let argsValue;
                    let cubeCraftLink = "https://www.cubecraft.net/members/"
                    //check at what index the element has a substring of cubeCraftLink
                    for (linkIndex = 0; linkIndex < args.length; ++linkIndex){
                        argsValue = args[linkIndex];

                        if (argsValue.substring(0,cubeCraftLink.length) === cubeCraftLink) {
                            if (linkIndex === 0){
                                say(channelID, "Did you include your username and the game-mode?");
                                return;
                            }
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

                    forumLink = args[linkIndex];

                    GM = args.splice(0, linkIndex); //Get all the words upto the forum link and remove them from args
                    GM = GM.join(" ");
                    args = args.splice(1); //remove forums link from args
                    message = args.join(" "); //join the rest of args as the message


                } else {
                    say(channelID, "Not enough arguments. Use `$help` to see proper usage.");
                    return;
                }

                say(channelID, `Your submission will be reviewed! <@${userID}>`);

                let submissions = db.get('botInfo.submissions').value();
                submissions = submissions + 1;
                db.set('botInfo.submissions', submissions)
                    .write()

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
                break;
            case "submissions":
            case "subs":
                let subs = db.get('botInfo.submissions').value();
                say(channelID, `${subs} submissions have been made since March 17 2021!`);
                break;
            case "bind": //save a file with the channelID
                let roleArr = evt.d.member.roles; //check what roles the user has
                let savedRole = db.get('botInfo.role').value();

                //check if the querying user has the role
                if (roleArr.includes(savedRole) || savedRole === "undefined") {
                    if (typeof args[0] !== 'undefined') { //Check if there is an argument

                        let role = args[0].substring(3, args[0].length - 1);

                        db.set('botInfo.role', role)
                            .write();
                        console.log("Role has been saved.");
                        say(channelID, `Only <@&${role}> will now be able to use the bind command.`);

                    } else {
                        db.set('botInfo.channelID', channelID)
                            .write();
                        console.log("channelID has been stored.");
                        say(channelID, `RecordBot will now send submissions to <#${channelID}>`);
                    }
                } else {
                    say(channelID, "You do not have permission to use this command.");
                }
                break;
            case "form":
                bot.sendMessage({
                    to: channelID,
                    message: '',
                    embed: {
                        title: "CCG Records Form",
                        url: "https://docs.google.com/forms/d/e/1FAIpQLSeSpzL1aHLTHUSmqNmMCuzlcvxVLiXzs8M_knuzy2ijuDuw4Q/viewform"
                    }
                })
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
            case "connect":
                if (args.length > 1){
                    let linkIndex;
                    let argsValue;
                    let cubeCraftLink = "https://www.cubecraft.net/members/"
                    let forumLink
                    let badUsage
                    //check at what index the element has a substring of cubeCraftLink
                    for (linkIndex = 0; linkIndex < args.length; ++linkIndex) {
                        argsValue = args[linkIndex];

                        if (argsValue.substring(0, cubeCraftLink.length) === cubeCraftLink) {
                            if (linkIndex === 0) {
                                say(channelID, "Type your name first and then the link :)");
                                return;
                            }
                            forumLink = argsValue;
                            args.splice(linkIndex, 1)
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

                    let IGN = args.join(" ");

                    if (!db.get('users').find({id: userID}).value()){
                        db.get('users')
                            .push({ id: userID, IGN: IGN, forums: forumLink})
                            .write()
                        say(channelID, "Successfully connected your account!")
                    } else {
                        db.get('users')
                            .find({id:userID})
                            .assign({IGN: IGN, forums: forumLink})
                            .write()
                        say(channelID, "Successfully updated your credentials.")
                    }

                }
                else {
                    say(channelID, "Please include your username and forum link.");
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

                                "$submit [IGN] [Game-mode] [forum profile link] [Your message] [evidence]\n" +
                                "- Submit your record! \n\n" +
                                "Example of usage:\n" +
                                "`$submit rubik_cube_man Parkour https://www.cubecraft.net/members/rubik_cube_man.5/ " +
                                "\nFastest time Barn 1 5:232s [evidence]`\n\n" +

                                "$form\n" +
                                "- Sends a link to a google form through which you can submit your record too!\n\n" +

                                "$link\n" +
                                "- Sends a link to the CCG Records Thread.\n\n" +

                                "$connect [In-Game Name] [Forums link]\n" +
                                "- Allows you to link your account for easier submissions."


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
