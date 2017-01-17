exports.commands = [
	"stock"
]

exports.stock = {
	usage: "<stock to fetch>",
	process: function(bot,msg,suffix) {
		var yahooFinance = require('yahoo-finance');
		yahooFinance.snapshot({
		  symbol: suffix,
		  fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
		}, function (error, snapshot) {
			if(error){
				msg.channel.sendMessage("couldn't get stock: " + error);
			} else {
				//msg.channel.sendMessage(JSON.stringify(snapshot));
				msg.channel.sendMessage(snapshot.name
					+ "\nprice: $" + snapshot.lastTradePriceOnly);
			}
		});
	}
}