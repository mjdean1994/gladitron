var request = require("request");

var config = require("../config.json");

module.exports.getJSON = function(path, qs, callback) {
  var options = {
    url: 'https://us.api.battle.net' + path,
    qs: qs
  };

  request(options, function (error, response, body) {
    if(error)
    {
      console.log(error);
    }

    callback(response, JSON.parse(body));
  });
}

var compare = function(a,b) {
  if (a.rating < b.rating)
    return 1;
  if (a.rating > b.rating)
    return -1;
  return 0;
}

var getGuildMembers = function(consumerSettings, callback)
{
  module.exports.getJSON("/wow/guild/" + consumerSettings.realm + "/" + encodeURIComponent(consumerSettings.guild), {locale: consumerSettings.locale, apiKey: config.wowApiToken, fields: "members"}, function(response, body)
  {
    var names = [];
    for(var i = 0; i < body.members.length; i++)
    {
      var member = body.members[i];
      if(member.character.level == config.maxLevel)
      {
        names.push(member.character.name);
      }
    }

    callback(names);
  });
}

var getMemberStats = function(name, realm, locale, bracket, callback) 
{
  module.exports.getJSON("/wow/character/" + realm + "/" + encodeURIComponent(name), {locale: locale, apiKey: config.wowApiToken, fields: "pvp"}, function(response, body)
  {
    if(body == null || body.pvp == null || body.pvp.brackets == null)
    {
      console.log("Unexpected null value. Printing body:");
      console.log(JSON.stringify(body));
    }

    var data = {name: name, rating: 0}
    if(bracket == "2v2")
    {
      data.rating = body.pvp.brackets.ARENA_BRACKET_2v2.rating;
    }
    else if(bracket == "3v3")
    {
      data.rating = body.pvp.brackets.ARENA_BRACKET_3v3.rating;
    }
    else if(bracket == "rbg")
    {
      data.rating = body.pvp.brackets.ARENA_BRACKET_RBG.rating;
    }

    callback(data);
  });
}

module.exports.getLadder = function(consumerSettings, bracket, count, callback)
{
  getGuildMembers(consumerSettings, function(names) {
    var ratings = [];
    var completed = 0;
    for(var i = 0; i < names.length; i++)
    {
      setTimeout(getMemberStats, 20 * i, names[i], consumerSettings.realm, consumerSettings.locale, bracket, function(data) {
        completed++;
        ratings.push(data);
        if(completed >= names.length)
        {
          callback(ratings.sort(compare).slice(0, count));
        }
      });
    }
  })
}