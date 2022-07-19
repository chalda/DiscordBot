var AuthDetails = require("../../auth.js").getAuthDetails();
exports.commands = ["stock"];

const formatStockPrice = (num) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};

const parseResposneAndSend = (stock, channel) => {
  const { price, symbol, timestamp } = stock;
  const formattedPrice = formatStockPrice(price);

  channel.send("", {
    embed: {
      title: symbol.toUpperCase(),
      description: `__**Price: ${formattedPrice}**__\n`,
      url: "https://finage.co.uk/stock/" + symbol,
    },
  });
};

if (AuthDetails.finage_api_key) {
  var request = require("request");
  var Discord = require("discord.js");

  exports.stock = {
    usage: "<ticker>[,<ticker>,...]",
    description:
      "Returns a stock price for a given ticker. Example: !stock TSLA",
    process: function (bot, msg, suffix) {
      if (!suffix) {
        msg.channel.send(this.description);
        return;
      }
      let stock_api_url = "https://api.finage.co.uk";
      stock_api_url += suffix.includes(",")
        ? `/last/trade/stocks?symbols=${suffix}&`
        : `/last/trade/stock/${suffix}?`;
      stock_api_url += `apikey=${AuthDetails.finage_api_key}`;
      request(
        {
          url: stock_api_url,
        },
        function (err, res, body) {
          console.log(body);
          let result = JSON.parse(body);
          if (result.error) {
            msg.channel.send(result.error);
          } else if (result.success === false) {
            msg.channel.send(
              `Error Status ${result.statusCode}: ${result.message}`
            );
          } else {
            if (result.length) {
              for (let stock of result) {
                parseResposneAndSend(stock, msg.channel);
              }
            } else {
              parseResposneAndSend(result, msg.channel);
            }
          }
        }
      );
    },
  };
} else {
  exports.stock = {
    usage: "<stock to fetch>",
    process: function (bot, msg, suffix) {
      msg.channel.send("API Key has not been set up yet");
    },
  };
}
