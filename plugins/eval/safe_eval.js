const {NodeVM, VM} = require('vm2');
const path = require('path');
const _ = require('lodash');

const vm = new VM({
    timeout: 100,
    sandbox: {
        _: _
    }
});

exports.commands = [
    "eval",
    "exec"
]

const rmvBacktickRgx = /```\w+(.*)```|```(.*)```|`(.*)`/ms;
function removeBackticks(content) {
    let match = content.match(rmvBacktickRgx);
    console.log(JSON.stringify(match));
    let result = content;
    if(match) {
        if(match[1]) {
            result = match[1];
        }
        if(match[2]) {
            result = match[2];
        }
        if(match[3]) {
            result = match[3];
        }
    }
    console.log(result);
    return result;
}

exports.eval = {
    description: "Evaluates a javascript expression in a Sandboxed node interpreter",
    process: (client, msg, suffix) => {
        const trimmed = _.trim(removeBackticks(_.trim(suffix)));
        console.log("Evaluating: " + trimmed);
        try{
            let result = JSON.stringify(vm.run(trimmed), null, 2);
            if (result) {
                msg.channel.send(result);
            }
        } catch(e){
            msg.channel.send(JSON.stringify(e, null, 2));
        }
    }
}

exports.exec = {
    description: "Evaluates javascript code in a Sandboxed node environment. the code MUST be compilable javascript code (eg return 2+2), not arbitrary interpretable statements (eg 2+2)",
    process: (client, msg, suffix) => {
        const trimmed = _.trim(removeBackticks(_.trim(suffix)))
        console.log(trimmed)
        const jsVM = new NodeVM({
            require: {
                external: ['discord.js', 'request-promise'],
                root: [
                    path.resolve(__dirname, '..', '..', 'node_modules')
                ]
            },        
            sandbox: {
                _,
                client,
                msg,
                suffix
            },
            timeout: 100
        });        
        try{
            let result = JSON.stringify(jsVM.run(trimmed, __filename), null, 2);
            if (result) {
                msg.channel.send(result);
            }
        } catch(e){
            msg.channel.send(JSON.stringify(e, null, 2));
        }
    }
}
