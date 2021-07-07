//Main file
//Author: Christian Martens
//Last update: 17/03/2021
//version 1.3

const Discord = require('discord.io');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const adapter2 = new FileSync('queue.json');
const queue = low(adapter2);

const adapter3 = new FileSync('help.json');
const help = low(adapter3);

db.defaults({ botInfo: {}, help: [] , users: []})
    .write()

queue.defaults({ verification: [], submissions: []})
    .write()

help.defaults({ commandInfo: []})
    .write()

const bot = new Discord.Client({
    token: db.get('botInfo.token').value(), //Read the bot token from the db
    autorun: true
});
bot.on("ready", function () {
    console.log("Bot started, logged in as: " + bot.username);
});

let games = ["Archer Assault", "Assassination", "BlockWars", "BlockWars Bridges", "Battle Zone", "Colony Control", "Competitive Parkour", "Duel", "Solo EggWars", "Team EggWars", "Free For All", "Line Dash", "Solo Lucky Island", "Team Lucky Islands", "MinerWare", "Paintball", "Parkour", "Quake Craft", "Solo Survival Games", "Team Survival Games", "Slime Survival", "Layer Spleef", "Solo SkyWars", "Team SkyWars", "Tower Defence", "Wing Rush"];
let prefix = "$";
let cubeCraftLink = "https://www.cubecraft.net/members/"

bot.on('message', function (user, userID, channelID, message, evt) {


    if (message.substring(0, 1) === prefix) {

        if (message.substring(1, 4) === "say") {
            let args = message.substring(1).split(" ");
            args = args.splice(1);
            let channel = args[0].substring(2, args[0].length - 1);
            args = args.splice(1);
            let content = args.join(" ");
            say(channel, content);
            return;
        }

        let badUsage;

        let accept = false;

        let bind;



        let args = message.substring(1).split(/[ \n]/);
        let cmd = args[0];
        args = args.splice(1);
        switch (cmd) {
            case "Submit":
            case "submit":

                if (db.get('botInfo.queueChannelID').value()){
                    bind = db.get('botInfo.queueChannelID').value(); //read channelID from db
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

                let randomCode = Math.random().toString().substr(2, 4);
                let taken = queue.get('submissions').find({id: randomCode}).value();

                while(taken) {
                    randomCode = Math.random().toString().substr(2, 4);
                    taken = queue.get('submissions').find({id: randomCode}).value();
                }

                let botMessage;

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
                            text: "Submission code: " + randomCode
                        }
                    }
                }, (err, res) => {
                    botMessage = res.id;
                    queue.get('submissions')
                        .push({ id: randomCode, botMessage: botMessage, Uid: userID, IGN: IGN, forums: forumLink, GM: GM, message: message})
                        .write()
                    }
                );
                break;
            case "updateLB":
                say(channelID, "Fetching the latest leaderboard positions from Calorimod!");
                say(channelID, "```" + httpGetSync("https://api.calorimod.com/bookofrecords") + "```");
                break;
            case "submissions":
            case "subs":
                let subs = db.get('botInfo.submissions').value();
                say(channelID, `${subs} submissions have been made since March 17 2021!`);
                break;
            case "setMember":
                let memRole = args[0].substring(3, args[0].length - 1)
                db.set('botInfo.memberRole', memRole)
                    .write();
                say(channelID, `Set member role to <@&${memRole}>.`);
                break;
            case "setVerify":
                let verChan = args[0].substring(2, args[0].length - 1);
                db.set('botInfo.verificationChannel', verChan)
                    .write();
                say(channelID, `Set verification channel to <#${verChan}>`);
                break;
            case "bind": //save a file with the channelID
                let roleArr = evt.d.member.roles; //check what roles the user has
                let savedRole = db.get('botInfo.role').value();

                //check if the querying user has the role
                if (roleArr.includes(savedRole) || savedRole === "undefined") {
                    if (typeof args[0] !== 'undefined' && args[0] !== "queue" && args[0] !== "feedback") { //Check if there is an argument

                        let role = args[0].substring(3, args[0].length - 1);

                        db.set('botInfo.role', role)
                            .write();
                        console.log("Role has been saved.");
                        say(channelID, `Only <@&${role}> will now be able to use the bind command.`);

                    } else {
                        if (args[0] === "queue") {
                            db.set('botInfo.queueChannelID', channelID)
                                .write();
                            console.log("channelID has been stored.");
                            say(channelID, `RecordBot will now send submissions to <#${channelID}>`);
                        } else if (args[0] === "feedback") {
                            db.set('botInfo.feedbackChannelID', channelID)
                                .write();
                            console.log("channelID has been stored.");
                            say(channelID, `RecordBot will now send feedback to <#${channelID}>`);
                        }
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
                            .write();

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
            case "verify":
                let code = args[0];
                if (!code) {
                    say(channelID, "Please provide your forums link or submission code see help for more information.");
                    return;
                }
                if (code.substring(0, cubeCraftLink.length) === cubeCraftLink) {
                    let randomCode = Math.random().toString(36).substr(2, 9);
                    if (queue.get('verification').find({ id: userID}).value()) {
                        queue.get('verification')
                            .find({id:userID})
                            .assign({code: randomCode})
                            .write();
                    } else {
                        queue.get('verification')
                            .push({ id: userID, code: randomCode})
                            .write();
                    }
                    say(channelID, "A verification code will be sent to your forums account, this might take a while");
                    say(db.get('botInfo.verificationChannel').value(), `${evt.d.author.username}:\n${randomCode}\n${code}`);
                } else {
                    if (code === queue.get('verification').find({id: userID}).value().code ) {
                        let memberRole = db.get('botInfo.memberRole').value();
                        if (memberRole) {
                            bot.addToRole({
                                serverID: bot.channels[channelID].guild_id,
                                roleID: memberRole,
                                userID: userID,
                            }, (err) => {
                                if (err) console.log(err);
                            });
                            queue.get('verification')
                                .remove(queue.get('verification').find({id: userID}).value())
                                .write();
                        }
                    } else {
                        say(channelID, "The verification code does not match.")
                    }
                }
                break;
            case "accept":
            case "ac":
                accept = true;
            case "deny":
            case "dn":
            case "delete":
            case "del":
            {
                let feedbackChannel = db.get('botInfo.feedbackChannelID').value();
                let randomCode = args[0];
                args = args.splice(1);
                message = args.join(" ");

                let content = queue.get('submissions').find({id: randomCode}).value();
                bind = db.get('botInfo.queueChannelID').value();
                if (content){

                    bot.deleteMessage({
                        channelID: bind,
                        messageID: content.botMessage
                    });
                    console.log(content.message);
                    let subMessage = content.message.substring(0, 49);
                    if (content.message.length > 50) { subMessage = subMessage + '...';}


                    if (accept) {
                        say(feedbackChannel, `✅ <@${content.Uid}> Your ${content.GM} submission for "${subMessage}" has been accepted!`);
                    }
                    else if (message) {
                        bot.sendMessage({
                            to: feedbackChannel,
                            message: `❌ <@${content.Uid}> Your ${content.GM} submission for "${subMessage}" has been denied :c`,
                            embed: {
                                color: 0xfecc52,
                                title: `Staff Feedback`,
                                description: message,
                                timestamp: new Date(),
                            }
                        });
                    }

                    queue.get('submissions')
                        .remove(queue.get('submissions').find({id: randomCode}).value())
                        .write();

                } else {
                    say(channelID, "This submission does not exist (anymore).");
                }

            }
                break;
            case "help":

                let command = args[0];

                if (command && command !== "mod") {
                    let commandInfo = help.get('commandInfo').find({command: command}).value();

                    if (commandInfo) {
                        bot.sendMessage({
                            to: channelID,
                            message: '',
                            embed: {
                                color: 0xfecc52,
                                title: prefix + commandInfo.name,
                                description: commandInfo.description,
                                fields: [{
                                    name: "Aliases",
                                    value: commandInfo.aliases
                                },
                                {
                                    name: "Example",
                                    value: prefix + commandInfo.example
                                }],
                                footer: {
                                    text: ''
                                }
                            }
                        });
                    } else {
                        say(channelID, "This command does not exist!");
                    }

                } else {

                    bot.sendMessage({
                        to: channelID,
                        message: '',
                        embed: {
                            color: 0xfecc52,
                            title: 'RecordBot help',
                            description:
                                `Type \`${prefix}help <command>\` to get additional info about a command.\n` +
                                "Variables between square brackets `[var]` are required arguments\n" +
                                "Variables between pointy brackets `<var>` are optional.\n\n" +
                                `Leave out brackets when typing a command.\n` +
                                `Example: \`${prefix}help connect\``
                            ,
                            fields: [{
                                name: "Commands",
                                value:
                                    "help\n" +
                                    "submit\n" +
                                    "connect\n" +
                                    "form\n" +
                                    "link\n" +
                                    "verify"

                            } //You can put [masked links](http://google.com) inside of rich embeds.

                            ],
                            footer: {
                                text: ''
                            }
                        }
                    });

                    if (command === "mod") {
                        bot.sendMessage({
                            to: channelID,
                            message: '',
                            embed: {
                                color: 0xfecc52,
                                fields: [{
                                    name: "Extra commands",
                                    value:
                                        "accept [Submission code]\n" +
                                        "deny [Submission code] <feedback>\n" +
                                        "delete\n" +
                                        "bind\n" +
                                        "setMember\n" +
                                        "setVerify\n" +
                                        "say\n"
                                }]
                            }
                        });
                    }

                }

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

function httpGetSync(theUrl){
    let channelResponse = "Leaderboard Data: \n";
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.setRequestHeader("Authorization", "Bearer SGVsbG8gdGhlcmUhXG5HZW5lcmFsIEtlbm9iaSEgKmt1Y2gga3VjaCpcbllvdSBhcmUgYSBib2xkIG9uZS4K");
    xmlHttp.onload = function() {
       var json = JSON.parse(xmlHttp.responseText);
       for (let i = 0; i < games.length; i++){
        thisGame = games[i];
        channelResponse += thisGame + ": " + json[thisGame]["name"] + "\n";
        }
    };
    xmlHttp.send(null);
    return channelResponse;
}
   
