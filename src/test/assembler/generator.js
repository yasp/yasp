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
  
  test("ensure bitwriter jumpto works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    var array;

    // act
    writer.append(0xFF, 8);
    writer.jumpTo(4);
    writer.append(0x00, 4);
    
    array = writer.toUint8Array();

    // assert
    strictEqual(array[0], 0xF0);
  });
  
  test("ensure bitwriter jumpto works into the void", function() {
    // arrange
    var writer = new yasp.BitWriter();
    var array;

    // act
    writer.append(0xFF, 8);
    writer.jumpTo(16);
    writer.append(0xFF, 8);
    
    array = writer.toUint8Array();

    // assert
    strictEqual(array[0], 0xFF);
    strictEqual(array[1], 0x00);
    strictEqual(array[2], 0xFF);
  });
})();

(function() {
  var assembler, parser, lexer, analyser, generator;

  var convert2binary = function (array) {
    // method from: http://stackoverflow.com/a/16363518
    var bitsPerByte = 8;
    var string = "";

    function repeat(str, num) {
      if (str.length === 0 || num <= 1) {
        if (num === 1) {
          return str;
        }

        return '';
      }

      var result = '',
        pattern = str;

      while (num > 0) {
        if (num & 1) {
          result += pattern;
        }

        num >>= 1;
        pattern += pattern;
      }

      return result;
    }

    function lpad(obj, str, num) {
      return repeat(str, num - obj.length) + obj;
    }

    Array.prototype.forEach.call(array, function (element) {
      string += lpad(element.toString(2), "0", bitsPerByte);
    });

    return string;
  }
  
  
  module("assembler generator", {
    setup: function () {
      assembler = new yasp.Assembler();
      assembler.jobs = ['bitcode'];
      
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
    {input: "ORG 1 \n MOV b1, 2", result: "00000000000000000000000100000010", map: {2: 1}},
    {input: "DB 42", result: "00101010", map: { }},
    {input: "DB 42, 42, 42", result: "001010100010101000101010", map: { }},
    {input: "DW 1337", result: "0000010100111001", map: { }},
    {input: "DW 1337,1337,1337", result: "000001010011100100000101001110010000010100111001", map: { }},
    {input: "ORG 10 \n address: DA address", result: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001010", map: { }},
    {input: 'STRING "HI"', result: "010010000100100100000000", map: { }},
    {input: 'STRING "HI", "HI", "HI', result: "010010000100100100000000010010000100100100000000010010000100100100000000", map: { }},
    {input: "MOV b1, 2", result: "000000000000000100000010", map: {1: 0}},
    {input: "MOV b0, b1", result: "000100000000000000000001", map: { 1: 0 }},
    {input: "MOV W0, 1337", result: "00100000000000000000010100111001", map: { 1: 0 }},
    {input: "MOV W0, W1", result: "000100000100000000000001", map: { 1: 0 }},
    {input: "lbl: JMP lbl", result: "1011000000000000", map: { 1: 0 }},
    {input: "JMP lbl \n DB 255 \n lbl:", result: "101100000000001111111111", map: { 1: 0 }},
    {input: "MOV b0, b1 \n ORG 0 \n MOV b1, b0", result: "000100000000000000100000", map: { 1: 0, 3: 0 }},
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
    equal(convert2binary(pass4), params.result);
    equal(assembler.errors.length, 0, "syntax error check");
  });

  QUnit.cases(generator_cases).test("ensure map is generated properly", function(params) {
    // arrange
    var pass1, pass2, pass3, pass4, result;
    assembler.jobs = ['map']
    
    // act
    pass1 = lexer.pass(assembler, params.input);
    pass2 = analyser.pass(assembler, pass1)
    pass3 = parser.pass(assembler, pass2);
    generator.pass(assembler, pass3);
    
    // assert
    deepEqual(assembler.map, params.map);
    equal(assembler.errors.length, 0, "syntax error check");
  });
})();