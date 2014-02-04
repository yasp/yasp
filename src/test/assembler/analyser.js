(function() {
  module("assembler analyser");
  var analyser_cases = [
    {input: "asdf: hallo jahah \n molo: swag\n", labels: ["asdf", "molo"]},
    {input: "asdf asdf:\n hallo mallo\n yolo:", labels: ["yolo"]}
  ];

  QUnit.cases(analyser_cases).test("ensure analyser finds labels", function(params) {
    // arrange
    var lexer = new yasp.Lexer();
    var analyser = new yasp.Analyser();
    var pass1, pass2;
    var assembler = {
      symbols: {
        labels: [ ]
      },
      riseSyntaxError: function() {
        throw "Syntax error";
      }
    };

    // act
    pass1 = lexer.pass({ }, params.input);
    pass2 = analyser.pass(assembler, pass1);

    // assert
    for (var i = 0; i < assembler.symbols.labels.length; i++) {
      equal(assembler.symbols.labels[i].text, params.labels[i]);
    }
    deepEqual(pass1, pass2);
  });
})();