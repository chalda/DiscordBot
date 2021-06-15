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

exports.eval = {
    description: "Evaluates a javascript statement in a Sandboxed node interpreter",
    process: (client, msg, suffix) => {
        const trimmed = _.trim(_.trim(suffix), '`');
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
        const trimmed = _.trim(_.trim(suffix), '`');
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
