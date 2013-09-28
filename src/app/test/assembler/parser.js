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
    {input: "MOV W0, 100 \n PUSH W0 \n ASDF: GOTO ASDF \n", fails: false },
    {input: "", fails: false},
    {input: "MOV MOV MOV", fails: true},
    {input: "ASDF: GOTO ASDF\n\n\nPUSH W0 \n", fails: false}
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
})();