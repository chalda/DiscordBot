var request = require("request");
var Discord = require("discord.js");
var AuthDetails = require("../../auth.json");

exports.commands = [
    "stock"
]

exports.stock = {
	usage: "<ticker>",
	description: "Returns a stock price for a given ticker. Stonks.",
	process: function(bot,msg,suffix){
	let stock_api = "https://api.worldtradingdata.com/api/v1/stock?symbol="
		request({
			url: stock_api+suffix+"&api_token="+AuthDetails.stocks_key
		},
      function(err,res,body){
            let result = JSON.parse(body)
            if(result.Message){
                msg.channel.send(result.Message);
            } else {
                msg.channel.send(result.data[0].name+" $"+result.data[0].price);
              }
		});
	}
}
