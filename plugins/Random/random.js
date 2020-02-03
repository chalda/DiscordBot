exports.commands = [
    "date_fact",
    "year_fact",
    "bad_joke",
    "joke",
    "kanye",
    "trump",
    "ask_trump",
    "random_fact",
    "random_person",
    "math_fact"
]

exports.math_fact = {
    usage: "<random math>",
    description: "Gives a Random Math Fact",
    process: function (bot, msg, suffix) {
        require("request")("http://numbersapi.com/random/math?json",
            function (err, res, body) {
                var data = JSON.parse(body);
                if (data && data.text) {
                    msg.channel.send(data.text)
                }
            });
    }
},

    exports.year_fact = {
        description: "Gives a Random Year Fact",
        process: function (bot, msg, suffix) {
            require("request")("http://numbersapi.com/random/year?json",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.text) {
                        msg.channel.send(data.text)
                    }
                });
        }
    },

    exports.joke = {
        description: "Gives a Random Joke",
        process: function (bot, msg, suffix) {
            require("request")("https://sv443.net/jokeapi/v2/joke/Any",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.setup && data.delivery) {
                        msg.channel.send(data.setup)
                        msg.channel.send(data.delivery)
                    } else if (data && data.joke) {
                        msg.channel.send(data.joke)
                    }
                });
        }
    },

    exports.bad_joke = {
        description: "Gives a Dark Joke",
        process: function (bot, msg, suffix) {
            require("request")("https://sv443.net/jokeapi/v2/joke/Dark",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.setup && data.delivery) {
                        msg.channel.send(data.setup)
                        msg.channel.send(data.delivery)
                    } else if (data && data.joke) {
                        msg.channel.send(data.joke)
                    }
                });
        }
    },

    exports.kanye = {
        description: "Gives a Kanye quote",
        process: function (bot, msg, suffix) {
            require("request")("https://api.kanye.rest/",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.quote) {
                        msg.channel.send(data.quote)
                    }
                });
        }
    },

    exports.trump = {
        description: "Random Trump quotes.",
        process: function (bot, msg, suffix) {
            require("request")("https://api.whatdoestrumpthink.com/api/v1/quotes/random",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.message) {
                        msg.channel.send(data.message)
                    }
                });
        }
    },

    exports.ask_trump = {
        usage: "<nickname>",
        description: "Ask Trump about your name.",
        process: function (bot, msg, suffix) {
            require("request")("https://api.whatdoestrumpthink.com/api/v1/quotes/personalized?q=" + suffix,
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.message) {
                        msg.channel.send(data.message)
                    }
                });
        }
    },

    exports.date_fact = {
        description: "Gives a Random Date Fact",
        process: function (bot, msg, suffix) {
            require("request")("http://numbersapi.com/random/date?json",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.text) {
                        msg.channel.send(data.text)
                    }
                });
        }
    },

    exports.random_fact = {
        description: "Gives a Random Date Fact",
        process: function (bot, msg, suffix) {
            require("request")("https://uselessfacts.jsph.pl/random.json",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.text) {
                        msg.channel.send(data.text)
                    }
                });
        }
    },

    exports.random_person = {
        description: "Gives a Random Date Fact",
        process: function (bot, msg, suffix) {
            require("request")("https://randomuser.me/api/?inc=gender,name,nat",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.gender && data.name && data.nat) {
                        msg.channel.send(data.gender)
                        msg.channel.send(data.name)
                        msg.channel.send(data.nat)
                    }
                });
        }
    }
