var Wolfram = require('node-wolfram');
var AuthDetails = require("./auth.json");

function WolframPlugin () {
	this.wolfram = new Wolfram(AuthDetails.wolfram_api_key)
};

WolframPlugin.prototype.respond = function (query, channel, bot,tmpMsg) {
	this.wolfram.query(query, function(error, result) {
			if (error) {
				console.log(error);
				tmpMsg.edit("Couldn't talk to Wolfram Alpha :(")
			}
			else {
				if (result.length == 0){
					tmpMsg.edit("No results from WolframAlpha.");
					return;
				}
				tmpMsg.delete();
				var response = "";
				for(var a=0; a<result.queryresult.pod.length; a++)
        {
            var pod = result.queryresult.pod[a];
            response += pod.$.title+":\n";
            for(var b=0; b<pod.subpod.length; b++)
            {
                var subpod = pod.subpod[b];
								//can also display the plain text, but the images are prettier
                /*for(var c=0; c<subpod.plaintext.length; c++)
                {
                    response += '\t'+subpod.plaintext[c];
                }*/
								for(var d=0; d<subpod.img.length;d++)
								{
									response += "\n" + subpod.img[d].$.src;
									channel.sendMessage(response);
									response = "";
								}
            }
						response += "\n";
        }

			}
		});

};

module.exports = WolframPlugin;
