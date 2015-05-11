GLOBAL.yasp = {};

require('../app/js/assembler/passes/analyser.js');
require('../app/js/assembler/passes/generator.js');
require('../app/js/assembler/passes/lexer.js');
require('../app/js/assembler/passes/parser.js');
require('../app/js/assembler/assembler.js');
require('../app/js/commands.js');

function assemble (code) {
    var asm = new yasp.Assembler();

    var result = asm.assemble({
        'code': code,
        'jobs': ['bitcode']
    });

    var str = "";

    for(var i = 0; i < result.bitcode.length; i++) {
        str += String.fromCharCode(result.bitcode[i]);
    }

    process.stdout.write(str);
}

var file = process.argv[2];

if(file === '-') {
    var chunks = [];
    process.stdin.on('data', function (chunk) {
        chunks.push(chunk);
    });
    process.stdin.on('end', function () {
        var content = Buffer.concat(chunks).toString();
        assemble(content);
    });
} else if(file) {
    var content = require('fs').readFileSync(file);
    assemble(content);
} else {
    console.log('please supply filename or "-" as argument')
}
