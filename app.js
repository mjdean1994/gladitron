var Discord = require('discord.js');

var Consumers = require('./modules/consumers.js');
var Validation = require('./modules/validation.js');
var WowApiService = require("./modules/wowApiService.js");

var config = require("./config.json");

client = new Discord.Client();

client.login(config.discordToken);

client.on("ready", function(){
    console.log("Gladitron Bot now fully operational.")
    client.user.setGame("World of Warcraft");
})

client.on('message', message => {
    //Ignore the message if not properly prefixed.
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    var consumerSettings = Consumers.getConsumerSettings(message.channel.guild.id);

    if(command === "setrealm")
    {
        if(args < 1)
        {
            message.channel.send("Please specify a realm name.\n\nUsage: ```" + config.prefix + "setrealm {realmName}```");
            return;
        }

        newRealm = args.join("-").toLowerCase();

        Validation.validateRealm(newRealm, consumerSettings.locale, function(isValid) {
            if(!isValid)
            {
                message.channel.send("You didn't enter a valid realm name. Try again.\n\nUsage: ```" + config.prefix + "setrealm {realmName}```");
                return;
            }

            consumerSettings.realm = newRealm;
            Consumers.updateConsumerSettings(consumerSettings);

            message.channel.send("Realm has been updated to: " + consumerSettings.realm);
        });
    }
    else if(command === "setguild")
    {
        if(args.length < 1)
        {
            message.channel.send("Please specify a guild name.\n\nUsage: ```" + config.prefix + "setguild {guildName}```");
            return;
        }

        newGuild = args.join(" ");

        Validation.validateGuild(newGuild, consumerSettings.realm, consumerSettings.locale, function(isValid) {
            if(!isValid)
            {
                message.channel.send("That guild doesn't exist. Try again.\n\nUsage: ```" + config.prefix + "setguild {setguild}```");
                return;
            }

            consumerSettings.guild = newGuild;
            Consumers.updateConsumerSettings(consumerSettings);

            message.channel.send("Guild has been updated to: " + consumerSettings.guild);
        });
    }
    else if(command === "setlocale")
    {
        if(args.length < 1)
        {
            message.channel.send("Please specify a locale.\n\nUsage: ```" + config.prefix + "setlocale {en_US|en_EU|en_KR|en_TW}```");
            return;
        }

        newLocale = args[0];

        Validation.validateLocale(newLocale, function(isValid) {
            if(!isValid)
            {
                message.channel.send("That's not a valid locale.\n\nUsage: ```" + config.prefix + "setlocale {en_US|en_EU|en_KR|en_TW}```");
                return;
            }

            consumerSettings.locale = newLocale;
            Consumers.updateConsumerSettings(consumerSettings);

            message.channel.send("Locale has been updated to: " + consumerSettings.locale);
        });
    }
    else if(command === "ladder")
    {
        if(args.length < 1)
        {
            message.channel.send("Please specify a bracket.\n\nUsage: ```" + config.prefix + "ladder {2v2|3v3|rbg} {count (optional, default 10)}```");
        }

        var bracket = args[0];

        var count = 10;
        if(args.length >= 2 && !isNaN(args[1]))
        {
            count = parseInt(args[1]);
        }

        if(!Validation.validateBracket(bracket))
        {
            message.channel.send("That isn't a valid bracket. Try again.\n\nUsage: ```" + config.prefix + "ladder {2v2|3v3|rbg} {count (optional, default 10)}```");
            return;
        }

        WowApiService.getLadder(consumerSettings, bracket, count, function(data) {
            var msg = "```\"" + consumerSettings.guild + "\" Ladder for " + bracket.toUpperCase() + ":\n";

            for(var i = 0; i < data.length; i++)
            {
                var nameSpacer = "";
                for(var j = 0; j < 5 - (i + 1).toString().length; j++)
                {
                    nameSpacer += " ";
                }
                
                var ratingSpacer = " ";
                for(var j = 0; j < 20 - data[i].name.length; j++)
                {
                    ratingSpacer += " ";
                }

                msg += (i + 1) + "." + nameSpacer + data[i].name + ratingSpacer + data[i].rating + "\n";
            }

            msg += "```";

            message.channel.send(msg);
        });
    }
});
