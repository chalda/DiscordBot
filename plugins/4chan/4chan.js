var rp = require("request-promise");
var htmlToText = require("html-to-text");

exports.commands = [
	"4chan"
];

exports['4chan'] = {
	usage: '<board> <search terms>',
	description: 'looks up a thread on 4chan',
	process: function(bot, msg, suffix) {
		// variable to hold matches
		var matches = [];
		// get board to search
		var board = suffix.split(' ')[0];
		// get search string
		var searchString = suffix.slice(board.length + 1);
		var searchRegex = new RegExp(searchString, 'i');
		// pull the catalog of the board in question
		var restString = 'https://a.4cdn.org/' + board + '/catalog.json';
		var catalog;
		rp(restString)
		.then(function(response) {
			catalog = JSON.parse(response);
			// concatenate threads into one array
			var threads = [];
			for(var i = 0; i < catalog.length; ++i) {
				threads = threads.concat(catalog[i]['threads']);
			}
			// search thread subjects first
			for(var i = 0; i < threads.length; ++i) {
				if((threads[i]['sub'] != null) && (threads[i]['sub'].match(searchRegex))) {
					matches.push(threads[i]);
				}
			}
			// did any of the subjects match the search string?
			if(matches.length > 0) {
				var filepath = 'https://i.4cdn.org/' + board + '/' + matches[0]['tim'] + matches[0]['ext'];
				var name = matches[0]['name'];
				var subject = matches[0]['sub'];
				var comment = (matches[0]['com'] === null) ? '' : matches[0]['com'];
				var link = 'https://boards.4chan.org/' + board + '/thread/' + matches[0]['no'];
				var finalMessage = 'Image: ' + filepath + '\nName: ' + name + '\nSubject: ' + subject + '\nComment:\n' + htmlToText.fromString(comment) + '\nLink: ' + link;
				msg.channel.sendMessage(finalMessage);
			} else {
				// search thread bodies now
				for(var i = 0; i < threads.length; ++i) {
					if((threads[i]['com'] != null) && (threads[i]['com'].match(searchRegex))) {
						matches.push(threads[i]);
					}
				}
				// did any of the comments match the search string?
				if (matches.length > 0) {
					var filepath = 'https://i.4cdn.org/' + board + '/' + matches[0]['tim'] + matches[0]['ext'];
					var name = matches[0]['name'];
					var subject = (matches[0]['sub'] === null) ? '' : matches[0]['sub'];
					var comment = matches[0]['com'];
					var link = 'https://boards.4chan.org/' + board + '/thread/' + matches[0]['no'];
					var finalMessage = 'Image: ' + filepath + '\nName: ' + name + '\nSubject: ' + subject + '\nComment:\n' + htmlToText.fromString(comment) + '\nLink: ' + link;
					msg.channel.sendMessage(finalMessage);
				} else {
					msg.channel.sendMessage('4chan: No matches found.');
				}
			}
		})
		.catch(function(error) {
			msg.channel.sendMessage("4CHAN ERROR: " + error);
		});
	}
}
