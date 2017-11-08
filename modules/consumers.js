var fs = require("fs");

var consumers = require('../data/consumers.json');

module.exports.getConsumerSettings = function(id) 
{
	for(var i = 0; i < consumers.length; i++)
	{
		if(consumers[i].id == id)
		{
			return consumers[i];
		}
	}

	var newConsumer = {
		'id' : id,
		'realm' : '',
		'guild' : '',
		'locale' : 'en_US'
	}

	consumers.push(newConsumer);
	save();
	return newConsumer;
}

module.exports.updateConsumerSettings = function(consumer)
{
	for(var i = 0;  i < consumers.length; i++)
	{
		if(consumers[i].id == consumer.id)
		{
			consumers[i] = consumer;
			break;
		}
	}

	save();
}

var save = function ()
{
    fs.writeFile("./data/consumers.json", JSON.stringify(consumers), "utf8", (err) =>
    {
        if (err) throw err;
    });
}