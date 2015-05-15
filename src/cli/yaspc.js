var repl = require("repl");
var net = require("net");
var async = require("async");
var fs = require("fs");

var packettypes = {
    LOAD: 1,
    CONTINUE: 2
};

function send_packet(client, type, payload) {
    var len = 1 + 4 + (payload !== null ? payload.length : 0);
    var pak = new Buffer(len);

    pak.writeUInt8(type, 0);

    if(payload !== null) {
        pak.writeUInt32LE(payload.length, 1);
        payload.copy(pak, 5);
    } else {
        pak.writeUInt32LE(0, 1);
    }

    client.write(pak);
}

var commands = {
    help: function (params, cb) {
        console.log("I am the help!");
        cb();
    },
    load: function (params, cb) {
        fs.readFile(params[0], function (err, data) {
            if(!err) {
                var payload = new Buffer(4 + data.length);
                payload.writeUInt32LE(data.length, 0);
                data.copy(payload, 4);
                send_packet(client, packettypes.LOAD, payload);
            } else {
                console.log("could not load file: ", err);
            }
            cb();
        });
    },
    continue: function (params, cb) {
        var payload = new Buffer(2);
        payload.writeUInt16LE(1, 0);
        send_packet(client, packettypes.CONTINUE, payload);
        cb();
    },
    exit: function (params, cb) {
        process.exit(0);
    }
};

function tryCommand(cmd, params, cb) {
    if(commands[cmd]) {
        commands[cmd](params, cb);
    } else {
        cb("cmd-not-found");
    }
}

function replEval(src, ctx, name, cb) {
    var cmdParts = src.trim().split(" ");

    tryCommand(cmdParts[0], cmdParts.splice(1), function (err) {
        if(err) {
            switch(err) {
                case "cmd-not-found":
                    console.error("command not found");
                    break;
                default:
                    break;
            }
        }

        cb();
    });
}

function startRepl() {
    repl.start("yasp> ", null, replEval, true, true);
}

console.log("connecting to yaspc..");

var client = net.createConnection("/tmp/yasp");

client.on("connect", function() {
    console.log("connected!");
    startRepl();
});
