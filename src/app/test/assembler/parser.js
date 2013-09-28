(function () {
  var assemblerMockup;

  module("assembler parser", {
    setup: function () {
      assemblerMockup = {
        riseSyntaxError: function () {
          this.errors = true;
          throw "Syntax error";
        },
        errors: false
      };
    },
    teardown: function () {
      assemblerMockup = null;
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
    var parser = new yasp.Parser();
    var lexer = new yasp.Lexer();
    var pass1, pass2;

    // act
    pass1 = lexer.pass(assemblerMockup, params.input);
    pass2 = parser.pass(assemblerMockup, pass1);

    // assert
    ok(params.fails ? assemblerMockup.errors : !assemblerMockup.errors);
  });
})();