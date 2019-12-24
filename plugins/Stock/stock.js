var string = require('string-sanitizer');
var axios = require('axios');
var cheerio = require('cheerio');
var url = 'https://web.tmxmoney.com/quote.php?qm_symbol=';

exports.commands = [
        "stock"
]

exports.stock = {
        usage: "<stock to fetch>",
        process: function(bot, msg, suffix) {
                suffix = string.sanitize(suffix);
                var qurl = url + suffix + ":US";
                axios.get(qurl).then(response => {
                        if(response.status === 200) {
                                var html = response.data;
                                var $ = cheerio.load(html);
                                var price = $('.price > span').text()
                                console.log(suffix + " price: $" + price);
                                msg.channel.send(suffix + " price: $" + price);
                        } else {
                                console.log("error fetching quote.\nStatus: " + response.status);
                                msg.channel.send("Error fetching quote.");
                        }
                })
                .catch(error => {
                        console.log(error);
                        msg.channel.send("Error completing request for stock quote.");
                });
        }
}
