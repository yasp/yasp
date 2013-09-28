(function() {
  module("assembler bitwriter");
  
  test("ensure bitwriter append works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    
    // act
    writer.append(0xFF, 8);
    
    // assert
    strictEqual(writer.bits, "11111111");
  });
  
  test("ensure bitwriter touint8array works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    var array;
    
    // act
    writer.append(0xFF, 8);
    array = writer.toUint8Array();
    
    // assert
    strictEqual(array[0], 0xFF);
  });
  
  test("ensure bitwriter normalizing works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    var array;

    // act
    writer.append(0xFF, 4);
    array = writer.toUint8Array();

    // assert
    strictEqual(array[0], 0xF0);
  });
})();

(function() {
  var assembler, parser, lexer, analyser, generator;
  
  module("assembler generator", {
    setup: function () {
      assembler = new yasp.Assembler();
      parser = new yasp.Parser();
      lexer = new yasp.Lexer();
      analyser = new yasp.Analyser();
      generator = new yasp.Generator();
    },
    teardown: function () {
      assembler = null;
      parser = null;
      lexer = null;
      analyser = null;
      generator = null;
    }
  });
  
  var generator_cases = [
    {input: "MOV b1, 2", result: "000000000000000100000010"}
  ];
  
  QUnit.cases(generator_cases).test("ensure generator generating works", function(params) {
    // arrange
    var pass1, pass2, pass3, pass4;

    // act
    pass1 = lexer.pass(assembler, params.input);
    pass2 = analyser.pass(assembler, pass1)
    pass3 = parser.pass(assembler, pass2);
    pass4 = generator.pass(assembler, pass3);

    // assert
    equal(params.result, pass4.toString(2));
  });
})();