var request = require("request");
var Discord = require("discord.js");
var AuthDetails = require("../../auth.json");

exports.commands = [
    "stock"
]

exports.stock = {
	usage: "<ticker>[,<ticker>,...]",
	description: "Returns a stock price for a given ticker. Example: !stock TSLA,BRK.A,PHIA.AS",
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
                result.data.forEach(stock => {
                  let price = new Intl.NumberFormat("en-US",{ style: 'currency', currency: stock.currency}).format(stock.price);
                  let market_cap = new Intl.NumberFormat("en-US",{ style: 'currency', currency: stock.currency}).format(stock.market_cap);
                  let eps = new Intl.NumberFormat("en-US",{ style: 'currency', currency: stock.currency}).format(stock.eps);
                  msg.channel.send("", {
                    embed: {
                      title: stock.name,
                      description:
                        "__**Price: " + price + "**__\n" +
                        "Market Cap " + market_cap + "\n" + 
                        "Earnings Per Share: " + eps,
                      url: "https://www.worldtradingdata.com/stock/" + stock.symbol,
                      footer: {
                        "text": stock.stock_exchange_long
                      }
                    }
                  });
              })
            }
      
		});
	}
}
