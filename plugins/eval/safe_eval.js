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

const rmvBacktickRgx = new RegExp("```w+(.*)```|```(.*)```|`(.*)`", 'ms')
function removeBackticks(content) {
    return content.match(rmvBacktickRgx)[0]
}

exports.eval = {
    description: "Evaluates a javascript statement in a Sandboxed node interpreter",
    process: (client, msg, suffix) => {
        const trimmed = _.trim(removeBackticks(_.trim(suffix)))
        console.log(trimmed)
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
    description: "Evaluates a javascript code in a Sandboxed node environment. the code MUST be compilable javascript code (eg return 2+2), not arbitrary interpretable statements (eg 2+2)",
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
