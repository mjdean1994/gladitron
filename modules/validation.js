var wowApiService = require('./wowApiService.js');

var config = require("../config.json");
var realmData = null;


module.exports.loadRealmData = function(locale, callback)
{
	wowApiService.getJSON("/wow/realm/status", {locale: locale, apiKey: config.wowApiToken}, function(response, body) {
		realmData = body.realms;
		callback();
	});
}

module.exports.validateRealm = function(realmName, locale, callback)
{
	//if we haven't already cached the realm data, do it now.
	if(realmData == null)
	{
		module.exports.loadRealmData(locale, function() {
			for(var i = 0; i < realmData.length; i++)
			{
				if(realmData[i].slug == realmName)
				{
					callback(true);
					return;
				}
			}

			callback(false);
			return;
		});
	}	
	else
	{
		for(var i = 0; i < realmData.length; i++)
		{
			if(realmData[i].slug == realmName)
			{
				callback(true);
				return;
			}
		}

		callback(false);
		return;
	}
}

module.exports.validateGuild = function(guildName, realmName, locale, callback)
{
	wowApiService.getJSON("/wow/guild/" + realmName + "/" + encodeURIComponent(guildName), {locale: locale, apiKey: config.wowApiToken}, function(response, body)
	{
		if(response.statusCode == 200)
		{
			callback(true);
		}
		else
		{
			callback(false);
		}
	});
}

module.exports.validateLocale = function(locale, callback)
{
	if(locale != "en_US" && locale != "en_EU" && locale != "en_KR" && locale != "en_TW")
	{
		callback(false);
		return;
	}
	callback(true);
}

module.exports.validateBracket = function(bracket)
{
	if(bracket != "2v2" && bracket != "3v3" && bracket != "rbg")
	{
		return false;
	}

	return true;
}