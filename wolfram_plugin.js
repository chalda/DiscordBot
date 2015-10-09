var util = require('util');
var winston = require('winston');
var wolfram_node = require('wolfram');
var AuthDetails = require("./auth.json");


function WolframPlugin () {
	this.wolfram = wolfram_node.createClient(AuthDetails.wolfram_api_key)
};


WolframPlugin.prototype.respond = function (query, channel, bot) {
	this.wolfram.query(query, function(error, result) {
			if (error) {
				//winston.error("Error querying youtube: " + error);
				console.log(error);
			}
			else {
				if (result.length == 0){
					return;
				}
				//prints all results as images... could be a lot of them
				for(var n = 0; n < result.length; n++){
				}
				
			}
		});

};


module.exports = WolframPlugin;
