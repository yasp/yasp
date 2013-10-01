(function () {
  var tokens = [
    {text: "A"},
    {text: "B"},
    {text: "\n"}
  ];
  var iterator;
  module("assembler tokeniterator", {
    setup: function () {
      var assemblerMockup = {
        riseSyntaxError: function () {
          throw "Syntax error";
        }
      };

      iterator = new yasp.TokenIterator(assemblerMockup, tokens);
    },
    teardown: function () {
      iterator = null;
    }
  });
  test("ensure tokeniterator match working", function () {
    strictEqual(iterator.match("A").text, "B");
  });
  test("ensure tokeniterator match not working", function () {
    throws(function () {
      iterator.match("B");
    });
  });

  test("ensure tokeniterator is working", function () {
    ok(iterator.is("A") == true);
  });

  test("ensure tokeniterator next working", function () {
    strictEqual(iterator.next().text, "B");
  });
  test("ensure tokeniterator next not working", function () {
    throws(function () {
      iterator.next();
      iterator.next();
      iterator.next();
    });
  });

  test("ensure tokeniterator current working", function () {
    strictEqual(iterator.current().text, "A");
  });

  test("ensure tokeniterator hasNext working", function () {
    ok(iterator.hasNext());
  });

  test("ensure tokeniterator hasNext not working", function () {
    iterator.next();
    iterator.next();
    ok(!iterator.hasNext());
  });

  test("ensure tokeniterator restore working", function () {
    iterator.restore();
    ok(!iterator.hasNext());
  });

  test("ensure tokeniterator iterate working", function() {
    iterator.iterate(function() { });
    ok(!iterator.hasNext());
  });

  test("ensure tokeniterator setting position works", function() {
    var pos = iterator.pos;
    iterator.next();
    iterator.next();
    iterator.pos = pos;
    iterator.next();
    strictEqual(iterator.current().text, "B");
  })
})();

(function () {
  var assembler;
  module("assembler end2end", {
    setup: function() {
      assembler = new yasp.Assembler();
    },
    teardown: function() {
      assembler = null;
    }
  });
  test("ensure assembler generating bitcode", function() {
    // arrange
    var result, params;
    params = {
      code: "MOV b0, 42",
      jobs: ['bitcode']
    };
    
    // act
    var result = assembler.assemble(params);
    
    // assert
    ok(result.bitcode && !result.symbols && !result.map);
  });
  
  test("ensure assembler keeps no state", function() {
    // arrange
    var result, params;
    params = {
      code: "MOV b0, 42",
      jobs: ['map']
    };

    // act
    assembler.assemble(params);
    assembler.assemble(params);
    assembler.assemble(params);
    var result = assembler.assemble(params);

    // assert
    ok(!result.bitcode && !result.symbols && result.map);
  });
  
  test("ensure assembler generating map", function() {
    // arrange
    var result, params;
    params = {
      code: "MOV b0, 42",
      jobs: ['map']
    };

    // act
    var result = assembler.assemble(params);

    // assert
    ok(!result.bitcode && !result.symbols && result.map);
  });
  
  test("ensure assembler generating symbol table", function() {
    // arrange
    var result, params;
    params = {
      code: "MOV b0, 42",
      jobs: ['symbols']
    };

    // act
    var result = assembler.assemble(params);

    // assert
    ok(!result.bitcode && result.symbols && !result.map);
  })
  
  test("ensure assembler returns error", function() {
    // arrange
    var result, params;
    params = {
      code: "dipfgjoidfgjdoüfgkdpfodpfk b0, 42",
      jobs: ['bitcode']
    };

    // act
    var result = assembler.assemble(params);

    // assert
    deepEqual(result, {
      "errors": [
        {
          "char": 0,
          "line": 0,
          "message": "Syntax error: Expecting command, directive or label, got unknown instead. in line 0 at character 0",
          "name": "E_ERR",
          "type": "error"
        }
      ],
      "success": false
    });
  });
})();
