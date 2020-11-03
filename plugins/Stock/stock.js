var AuthDetails = require("../../auth.js").getAuthDetails();
exports.commands = [
	"stock"
]

if(AuthDetails.worldtradingdata_api_key) {
	var request = require("request");
	var Discord = require("discord.js");

	exports.stock = {
		usage: "<ticker>[,<ticker>,...]",
		description: "Returns a stock price for a given ticker. Example: !stock TSLA,BRK.A,PHIA.AS",
		process: function(bot,msg,suffix){
		let stock_api = "https://api.worldtradingdata.com/api/v1/stock?symbol="
			request({
				url: stock_api+suffix+"&api_token="+AuthDetails.worldtradingdata_api_key
			},
		  function(err,res,body){
				console.log(body)
				let result = JSON.parse(body)
				if(result.Message){
					msg.channel.send(result.Message);
				} else if(result.message) {
					msg.channel.send(result.message);
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
} else {
	var string = require('string-sanitizer');
	var axios = require('axios');
	var cheerio = require('cheerio');
	var tmxmoney_url = 'https://web.tmxmoney.com/quote.php?qm_symbol=';

	exports.stock = {
			usage: "<stock to fetch>",
			process: function(bot, msg, suffix) {
					suffix = string.sanitize(suffix);
					var qurl = tmxmoney_url + suffix + ":US";
					axios.get(qurl).then(response => {
							if(response.status === 200) {
									var html = response.data;
									var $ = cheerio.load(html);
									var price = $('.price > span').text()
									console.log(suffix + " price: $" + price);
									msg.channel.send(suffix + " price: $" + price);
							} else {
									console.log("error fetching quote.\nStatus: " + response.status);
									msg.channel.send("Error fetching quote. Set up an API key for better stocks!");
							}
					})
					.catch(error => {
							console.log(error);
							msg.channel.send("Error completing request for stock quote.");
					});
			}
	}
}