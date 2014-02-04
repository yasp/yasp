(function () {
  var assembler, parser, lexer, analyser;

  module("assembler parser", {
    setup: function () {
      assembler = new yasp.Assembler();
      parser = new yasp.Parser();
      lexer = new yasp.Lexer();
      analyser = new yasp.Analyser();
    },
    teardown: function () {
      assembler = null;
      parser = null;
      lexer = null;
      analyser = null;
    }
  });

  var parser_cases = [
    {input: "MOV W0, 100 \n PUSH W0 \n ASDF: GOTO ASDF \n", fails: false, symbols:
    {
      "defines": { },
      "instructions": {
        "GOTO": 1,
        "MOV": 1,
        "PUSH": 1
      },
      "labels": {
        "ASDF": {
          "char": 2,
          "line": 3,
          "text": "ASDF"
        }
      },
      "usedRegisters": {
        "W0": 2
      }
    }},
    {input: "", fails: false},
    {input: "MOV MOV MOV", fails: true},
    {input: "MOV B0, B1, B3", fails: true},
    {input: "asdfdspsidhgeoighfg", fails: true},
    {input: "sub:", fails: true},
    {input: "DEFINE importantRegister W0 \n ASDF: GOTO ASDF\n\n\nPUSH importantregister \n END asdf yolomolo", fails: false, symbols: {
      "defines": {
        "IMPORTANTREGISTER": "W0"
      },
      "instructions": {
        "GOTO": 1,
        "PUSH": 1
      },
      "labels": {
        "ASDF": {
          "char": 2,
          "line": 2,
          "text": "ASDF"
        }
      },
      "usedRegisters": {
        "W0": 1
      }
    }}
  ];

  QUnit.cases(parser_cases).test("ensure parser syntax checking working", function (params) {
    // arrange
    var pass1, pass2, pass3;

    // act
    pass1 = lexer.pass(assembler, params.input);
    pass2 = analyser.pass(assembler, pass1)
    pass3 = parser.pass(assembler, pass2);

    // assert
    ok(params.fails ? assembler.errors.length > 0 : assembler.errors.length == 0);
  });
  
  QUnit.cases(parser_cases).test("ensure parser symbol table working", function(params) {
    // arrange
    assembler.jobs = ["symbols"];
    var pass1, pass2;
    
    // act
    pass1 = lexer.pass(assembler, params.input);
    pass2 = analyser.pass(assembler, pass1)
    parser.pass(assembler, pass2);
    
    // assert
    deepEqual(JSON.parse(JSON.stringify(assembler.symbols)), !!params.symbols ? params.symbols : {
      labels: { },
      usedRegisters: { },
      defines: { },
      instructions: { }
    });
  })
})();