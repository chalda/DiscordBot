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
    "addnode",
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
                    msg.channel.send({
                        embed: {
                            color: 1363892,
                            fields:
                                [
                                    { name: 'Random Math Fact', value: data.text, inline: true }
                                ]
                        }
                    })
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
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Year Fact', value: data.text, inline: true }
                                    ]
                            }
                        })
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
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Joke', value: data.setup + '\n' + data.delivery, inline: true }
                                    ]
                            }
                        })
                    } else if (data && data.joke) {
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Joke', value: data.joke, inline: true }
                                    ]
                            }
                        })
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
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Dark Joke', value: data.setup + '\n' + data.delivery, inline: true }
                                    ]
                            }
                        })
                    } else if (data && data.joke) {
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Dark Joke', value: data.joke, inline: true }
                                    ]
                            }
                        })
                    }
                });
        }
    },

    exports.kanye = {
        description: "Random Kanye quote",
        process: function (bot, msg, suffix) {
            require("request")("https://api.kanye.rest/",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.quote) {
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Kanye quote', value: data.quote, inline: true }
                                    ]
                            }
                        })
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
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Random Trump quote', value: data.message, inline: true }
                                    ]
                            }
                        })
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
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields:
                                    [
                                        { name: 'Ask Trump about your name', value: data.message, inline: true }
                                    ]
                            }
                        })
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
                        msg.channel.send({ embed: { color: 1363892,
                            fields:
                                [
                                    { name: 'Random Date Fact', value: data.text, inline: true }
                                ]
                            }
                        })
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
                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields: [
                                    { name: 'Random Fact', value: data.text, inline: true }
                                ]
                            }
                        })
                    }
                });
        }
    },


    exports.random_person = {
        description: "Gives a Random Identity",
        process: function (bot, msg, suffix) {
            require("request")("https://api.namefake.com/",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.name && data.address && data.latitude
                        && data.maiden_name && data.birth_data && data.phone_h
                        && data.phone_w && data.email_u && data.email_d && data.username
                        && data.password && data.domain && data.useragent && data.ipv4
                        && data.macaddress && data.plasticcard && data.cardexpir && data.bonus
                        && data.company && data.color && data.uuid && data.height && data.weight
                        && data.blood && data.eye && data.hair && data.pict && data.url && data.sport
                        && data.ipv4_url && data.email_url && data.domain_url) {


                        msg.channel.send({
                            embed: {
                                color: 1363892,
                                fields: [
                                    {name: 'Name & Maiden Name', value: data.name + ' , ' + data.maiden_name, inline: true },
                                    {name: 'Birth Date & Phone Number', value: data.birth_data + ' , ' + data.phone_h + ' , ' + data.phone_w, inline: true },
                                    { name: 'Latitude & Longitude', value: data.latitude + ' , ' + data.longitude, inline: true },
                                    { name: 'Email', value: data.email_u + '@' + data.email_d, inline: true },
                                    { name: 'Company & Bonus', value: data.company + ' , ' + data.bonus, inline: true },
                                    { name: 'Username & Password', value: data.username + ' , ' + data.password, inline: true },
                                    { name: 'Domain & User Agent', value: data.domain + ' , ' + data.useragent, inline: true },
                                    { name: 'Weight & Height & Blood Type', value: data.weight + ' , ' + data.height + ' , ' + data.blood, inline: true },
                                    { name: 'Hair & Eye & Sport', value: data.color + ' , ' + data.hair + ' , ' + data.eye + ' , ' + data.sport, inline: true },
                                    { name: 'IP & MAC', value: data.ipv4 + ' , ' + data.macaddress, inline: true },
                                    { name: 'Card INFO', value: data.plasticcard + ' , ' + data.cardexpir, inline: true },
                                    { name: 'Data INFO', value: data.url, inline: true }
                                ]
                            }
                        })
                    }
                });
        }
    }
