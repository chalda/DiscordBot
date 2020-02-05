

const bitcoin = require('bitcoin');
let config = require('config');
let spamchannel = config.get('botspamchannels');
let dngrConfig = config.get('dngr');
const dngr = new bitcoin.Client(dngrConfig);

exports.commands = [
    'tipdngr',
    'multitipdngr',
    'roletipdngr',
    'tips'
];

const helpmsg = {
    embed: {
        description:
            '__**TIPS**__\n\n' +
            '**Balance**: `!tipdngr balance`\n' +
            '**Deposit Address**: `!tipdngr deposit`\n' +
            '**Withdraw**: `!tipdngr withdraw <address> <amount>`\n' +
            '**Private Tip**: `!tipdngr private <user> <amount>`\n\n' +
            '__**ROLE TIPS**__ Use this to tip everyone in a role.\n\n' +
            '**Role Tip**: `!roletipdngr <role> <amount>`\n' +
            '**Private Role Tip**: `!privatetipdngr <role> <amount>`\n\n' +
            '__**MULTI TIPS**__ Use this to tipdngr multiple people at once.\n\n' +
            '**Multi Tip**: `!multitipdngr <user> <user> <amount>`\n' +
            '**Private Multi Tip** `!multitipdngr private <user> <user> <amount>`\n' +
            '**Note**: Multi tipdngrs can contain any amount of users to tipdngr.\n\n' +
            '__**FURTHER INFORMATION**__\n\n' +
            '**Help**: `!tipdngr help` *Get this message.\n',
        color: 1109218
    }
};


exports.tipdngr = {
    usage: '<subcommand>',
    description: 'Tip a given user with an amount of DNGR or perform wallet specific operations.',
    process: async function (bot, msg, suffix) {
        let tipper = msg.author.id.replace('!', ''),
            words = msg.content
                .trim()
                .split(' ')
                .filter(function (n) {
                    return n !== '';
                }),
            subcommand = words.length >= 2 ? words[1] : 'help',
            channelwarning = 'Please use <#' + spamchannel + '> or DMs to talk to bots.',
            MultiorRole = false;
        switch (subcommand) {
            case 'help':
                privateorSpamChannel(msg, channelwarning, doHelp, [helpmsg]);
                break;
            case 'balance':
                privateorSpamChannel(msg, channelwarning, doBalance, [tipper]);
                break;
            case 'deposit':
                privateorSpamChannel(msg, channelwarning, doDeposit, [tipper]);
                break;
            case 'withdraw':
                privateorSpamChannel(msg, channelwarning, doWithdraw, [tipper, words, helpmsg]);
                break;
            default:
                doTip(bot, msg, tipper, words, helpmsg, MultiorRole);
        }
    }
};

exports.multitipdngr = {
    usage: '<subcommand>',
    description: 'Tip multiple users simultaneously for the same amount of DNGR each.',
    process: async function (bot, msg, suffix) {
        let tipper = msg.author.id.replace('!', ''),
            words = msg.content
                .trim()
                .split(' ')
                .filter(function (n) {
                    return n !== '';
                }),
            subcommand = words.length >= 2 ? words[1] : 'help',
            channelwarning = 'Please use <#' + spamchannel + '> or DMs to talk to bots.',
            MultiorRole = true;
        switch (subcommand) {
            case 'help':
                privateorSpamChannel(msg, channelwarning, doHelp, [helpmsg]);
                break;
            default:
                doMultiTip(bot, msg, tipper, words, helpmsg, MultiorRole);
                break;
        }
    }
};

exports.roletipdngr = {
    usage: '<subcommand>',
    description: 'Tip all users in a specified role an amount of DNGR.',
    process: async function (bot, msg, suffix) {
        let tipper = msg.author.id.replace('!', ''),
            words = msg.content
                .trim()
                .split(' ')
                .filter(function (n) {
                    return n !== '';
                }),
            subcommand = words.length >= 2 ? words[1] : 'help',
            channelwarning = `Please use <#${spamchannel}> or DMs to talk to bots.`,
            MultiorRole = true;
        switch (subcommand) {
            case 'help':
                privateorSpamChannel(msg, channelwarning, doHelp, [helpmsg]);
                break;
            default:
                doRoleTip(bot, msg, tipper, words, helpmsg, MultiorRole);
                break;
        }
    }
};

exports.tips = {
    usage: '',
    description: 'Lists all available tipbot commands with brief descriptions for each command.',
    process: async function (bot, msg, suffix) {
        msg.reply(helpmsg);
    }
};

function privateorSpamChannel(message, wrongchannelmsg, fn, args) {
    if (!inPrivateOrBotSandbox(message)) {
        message.reply(wrongchannelmsg);
        return;
    }
    fn.apply(null, [message, ...args]);
}

function doHelp(message, helpmsg) {
    message.author.send(helpmsg);
}

function doBalance(message, tipper) {
    dngr.getBalance(tipper, 1, function (err, balance) {
        if (err) {
            message.reply('Error getting DangerCoin (DNGR) balance.').then(message => message.delete(10000));
        } else {
            message.channel.send({
                embed: {
                    description: '**:bank::money_with_wings::moneybag:DangerCoin (DNGR) Balance!:moneybag::money_with_wings::bank:**',
                    color: 1363892,
                    fields: [
                        {
                            name: '__User__',
                            value: '<@' + message.author.id + '>',
                            inline: false
                        },
                        {
                            name: '__Balance__',
                            value: '**' + balance.toString() + '**',
                            inline: false
                        }
                    ]
                }
            });
        }
    });
}

function doDeposit(message, tipper) {
    getAddress(tipper, function (err, address) {
        if (err) {
            message.reply('Error getting your DangerCoin (DNGR) deposit address.').then(message => message.delete(10000));
        } else {
            message.channel.send({
                embed: {
                    description: '**:bank::card_index::moneybag:DangerCoin (DNGR) Address!:moneybag::card_index::bank:**',
                    color: 1363892,
                    fields: [
                        {
                            name: '__User__',
                            value: '<@' + message.author.id + '>',
                            inline: false
                        },
                        {
                            name: '__Address__',
                            value: '**' + address + '**',
                            inline: false
                        }
                    ]
                }
            });
        }
    });
}

function doWithdraw(message, tipper, words, helpmsg) {
    if (words.length < 4) {
        doHelp(message, helpmsg);
        return;
    }

    var address = words[2],
        amount = getValidatedAmount(words[3]);

    if (amount === null) {
        message.reply("I don't know how to withdraw that much DangerCoin (DNGR)...").then(message => message.delete(10000));
        return;
    }

    dngr.getBalance(tipper, 1, function (err, balance) {
        if (err) {
            message.reply('Error getting DangerCoin (DNGR) balance.').then(message => message.delete(10000));
        } else {
            if (Number(amount) > Number(balance)) {
                message.channel.send('Please leave some DangerCoin (DNGR) for transaction fees!');
                return;
            }
            dngr.sendFrom(tipper, address, Number(amount), function (err, txId) {
                if (err) {
                    message.reply(err.message).then(message => message.delete(10000));
                } else {
                    message.channel.send({
                        embed: {
                            description: '**:outbox_tray::money_with_wings::moneybag:DangerCoin (DNGR) Transaction Completed!:moneybag::money_with_wings::outbox_tray:**',
                            color: 1363892,
                            fields: [
                                {
                                    name: '__Sender__',
                                    value: '<@' + message.author.id + '>',
                                    inline: true
                                },
                                {
                                    name: '__Receiver__',
                                    value: '**' + address + '**\n' + addyLink(address),
                                    inline: true
                                },
                                {
                                    name: '__txid__',
                                    value: '**' + txId + '**\n' + txLink(txId),
                                    inline: false
                                },
                                {
                                    name: '__Amount__',
                                    value: '**' + amount.toString() + '**',
                                    inline: true
                                }
                            ]
                        }
                    });
                }
            });
        }
    });
}

function doTip(bot, message, tipper, words, helpmsg) {
    if (words.length < 3 || !words) {
        doHelp(message, helpmsg);
        return;
    }
    var prv = false;
    var amountOffset = 2;
    if (words.length >= 4 && words[1] === 'private') {
        prv = true;
        amountOffset = 3;
    }

    let amount = getValidatedAmount(words[amountOffset]);

    if (amount === null) {
        message.reply("I don't know how to tip that much DangerCoin (DNGR)...").then(message => message.delete(10000));
        return;
    }

    dngr.getBalance(tipper, 1, function (err, balance) {
        if (err) {
            message.reply('Error getting DangerCoin (DNGR) balance.').then(message => message.delete(10000));
        } else {
            if (Number(amount) > Number(balance)) {
                message.channel.send('Please leave some DangerCoin (DNGR) for transaction fees!');
                return;
            }

            if (!message.mentions.users.first()) {
                message
                    .reply('Sorry, I could not find a user in your tip...')
                    .then(message => message.delete(10000));
                return;
            }
            if (message.mentions.users.first().id) {
                sendDNGR(bot, message, tipper, message.mentions.users.first().id.replace('$', ''), amount, prv);
            } else {
                message.reply('Sorry, I could not find a user in your tip...').then(message => message.delete(10000));
            }
        }
    });
}

function doMultiTip(bot, message, tipper, words, helpmsg, MultiorRole) {
    if (!words) {
        doHelp(message, helpmsg);
        return;
    }
    if (words.length < 4) {
        doTip(bot, message, tipper, words, helpmsg, MultiorRole);
        return;
    }
    let prv = false;
    if (words.length >= 5 && words[1] === 'private') {
        prv = true;
    }
    let [userIDs, amount] = findUserIDsAndAmount(message, words, prv);
    if (amount == null) {
        message.reply('Invalid amount of credits specified...').then(message => message.delete(5000));
        return;
    }
    if (!userIDs) {
        message.reply('Sorry, I could not find the user you are trying to tip...').then(message => message.delete(5000));
        return;
    }
    for (let i = 0; i < userIDs.length; i++) {
        sendDNGR(bot, message, tipper, userIDs[i].toString(), amount, prv, MultiorRole);
    }
}

function doRoleTip(bot, message, tipper, words, helpmsg, MultiorRole) {
    if (!words || words.length < 3) {
        doHelp(message, helpmsg);
        return;
    }
    let isPrivateTip = words.length >= 4 && words[1] === 'private';
    let amountOffset = isPrivateTip ? 3 : 2;

    let amount = getValidatedAmount(words[amountOffset]);
    if (amount === null) {
        message.reply("I don't know how to tip that amount of DNGR...").then(message => message.delete(10000));
        return;
    }

    let roleToTip = message.mentions.roles.first();
    if (roleToTip !== null) {
        let membersOfRole = roleToTip.members.keyArray();
        if (membersOfRole.length > 0) {
            let userIDs = membersOfRole.map(member => member.replace('!', ''));
            userIDs.forEach(u => {
                sendDNGR(bot, message, tipper, u, amount, isPrivateTip, MultiorRole);
            });
        } else {
            return message.reply('Sorry, I could not find any users to tip in that role...').then(message => message.delete(10000));
        }
    } else {
        return message.reply('Sorry, I could not find any roles in your tip...').then(message => message.delete(10000));
    }
}

function findUserIDsAndAmount(message, words, prv) {
    let idList = [];
    let amount = null;
    let count = 0;
    let startOffset = 1;
    if (prv) startOffset = 2;
    let regex = new RegExp(/<@!?[0-9]+>/);
    for (let i = startOffset; i < words.length; i++) {
        if (regex.test(words[i])) {
            count++;
            idList.push(words[i].match(/[0-9]+/));
        } else {
            amount = getValidatedAmount(words[Number(count) + 1]);
            break;
        }
    }
    return [idList, amount];
}

function sendDNGR(bot, message, tipper, recipient, amount, privacyFlag) {
    getAddress(recipient.toString(), function (err, address) {
        if (err) {
            message.reply(err.message).then(message => message.delete(10000));
        } else {
            dngr.sendFrom(tipper, address, Number(amount), 1, null, null, function (err, txId) {
                if (err) {
                    message.reply(err.message).then(message => message.delete(10000));
                } else {
                    if (privacyFlag) {
                        let userProfile = message.guild.members.find('id', recipient);
                        userProfile.user.send({
                            embed: {
                                description: '**:money_with_wings::moneybag:DangerCoin (DNGR) Transaction Completed!:moneybag::money_with_wings:**',
                                color: 1363892,
                                fields: [
                                    {
                                        name: '__Sender__',
                                        value: 'Private Tipper',
                                        inline: true
                                    },
                                    {
                                        name: '__Receiver__',
                                        value: '<@' + recipient + '>',
                                        inline: true
                                    },
                                    {
                                        name: '__txid__',
                                        value: '**' + txId + '**\n' + txLink(txId),
                                        inline: false
                                    },
                                    {
                                        name: '__Amount__',
                                        value: '**' + amount.toString() + '**',
                                        inline: true
                                    }
                                ]
                            }
                        });
                        message.author.send({
                            embed: {
                                description: '**:money_with_wings::moneybag:DangerCoin (DNGR) Transaction Completed!:moneybag::money_with_wings:**',
                                color: 1363892,
                                fields: [
                                    {
                                        name: '__Sender__',
                                        value: '<@' + message.author.id + '>',
                                        inline: true
                                    },
                                    {
                                        name: '__Receiver__',
                                        value: '<@' + recipient + '>',
                                        inline: true
                                    },
                                    {
                                        name: '__txid__',
                                        value: '**' + txId + '**\n' + txLink(txId),
                                        inline: false
                                    },
                                    {
                                        name: '__Amount__',
                                        value: '**' + amount.toString() + '**',
                                        inline: true
                                    }

                                ]
                            }
                        });
                        if (
                            message.content.startsWith('$tipdngr private ')
                        ) {
                            message.delete(1000); //Supposed to delete message
                        }
                    } else {
                        message.channel.send({
                            embed: {
                                description: '**:money_with_wings::moneybag:DangerCoin (DNGR) Transaction Completed!:moneybag::money_with_wings:**',
                                color: 1363892,
                                fields: [
                                    {
                                        name: '__Sender__',
                                        value: '<@' + message.author.id + '>',
                                        inline: true
                                    },
                                    {
                                        name: '__Receiver__',
                                        value: '<@' + recipient + '>',
                                        inline: true
                                    },
                                    {
                                        name: '__txid__',
                                        value: '**' + txId + '**\n' + txLink(txId),
                                        inline: false
                                    },
                                    {
                                        name: '__Amount__',
                                        value: '**' + amount.toString() + '**',
                                        inline: true
                                    }
                                ]
                            }
                        });
                    }
                }
            });
        }
    });
}

function getAddress(userId, cb) {
    dngr.getAddressesByAccount(userId, function (err, addresses) {
        if (err) {
            cb(err);
        } else if (addresses.length > 0) {
            cb(null, addresses[0]);
        } else {
            dngr.getNewAddress(userId, function (err, address) {
        if (err) {
            cb(err);
        } else {
            cb(null, address);
        }
            });
               }
    });
}

function inPrivateOrBotSandbox(msg) {
    return msg.channel.type === 'dm' || msg.channel.id === spamchannel;
}

function getValidatedAmount(amount) {
    amount = amount.toLowerCase().replace('dngr', '');
    return amount.match(/^[0-9]+(\.[0-9]+)?$/) ? amount : null;
}

function txLink(txId) {
    return '<http://dngrexplorer.cf/tx/' + txId + '>';
}

function addyLink(address) {
    return 'http://dngrexplorer.cf/address/' + address;
}