(function () {
  module("assembler lexer");
  var lexer_cases = [
    {
      input: '; ADC-Werte: \n                ;   0 ...  80 => rote LED leuchtet \n        ;  81 ... 165 => gelbe LED leuchtet \n        ; 166 ... 255 => grüne LED leuchtet \n        ; ================================= \n        s: \n                adc1 w0		; Wert von Poti einlesen \n        debug b1	; brauchbaren Teil zum Vergleichen ausgeben \n        cmp b1, 81	; auf erste Grenze testen \n        jnc m1		; wenn größer oder gleich dann weiter springen \n        high 3		; erste LED setzen \n        low 4		; zweite LED löschen \n        low 5		; dritte LED löschen \n        jmp s		; endlos \n        m1: \n                cmp b1, 166	; zweite Grenze testen \n        jnc m2		; wenn größer oder gleich dann weiter springen \n        low 3		; erste LED löschen \n        high 4		; zweite LED setzen \n        low 5		; dritte LED löschen \n        jmp s		; endlos \n        m2: \n                low 3		; erste LED löschen \n        low 4		; zweite LED löschen \n        high 5		; dritte LED setzen \n        jmp s		; endlos \n        end\n',
      output: [
          {
            "char": 2,
            "line": 1,
            "text": "\n"
          },
          {
            "char": 18,
            "line": 2,
            "text": "\n"
          },
          {
            "char": 10,
            "line": 3,
            "text": "\n"
          },
          {
            "char": 10,
            "line": 4,
            "text": "\n"
          },
          {
            "char": 10,
            "line": 5,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 6,
            "text": "s"
          },
          {
            "char": 10,
            "line": 6,
            "text": ":"
          },
          {
            "char": 12,
            "line": 6,
            "text": "\n"
          },
          {
            "char": 17,
            "line": 7,
            "text": "adc1"
          },
          {
            "char": 22,
            "line": 7,
            "text": "w0"
          },
          {
            "char": 27,
            "line": 7,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 8,
            "text": "debug"
          },
          {
            "char": 15,
            "line": 8,
            "text": "b1"
          },
          {
            "char": 19,
            "line": 8,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 9,
            "text": "cmp"
          },
          {
            "char": 13,
            "line": 9,
            "text": "b1"
          },
          {
            "char": 15,
            "line": 9,
            "text": ","
          },
          {
            "char": 17,
            "line": 9,
            "text": "81"
          },
          {
            "char": 21,
            "line": 9,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 10,
            "text": "jnc"
          },
          {
            "char": 13,
            "line": 10,
            "text": "m1"
          },
          {
            "char": 18,
            "line": 10,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 11,
            "text": "high"
          },
          {
            "char": 14,
            "line": 11,
            "text": "3"
          },
          {
            "char": 18,
            "line": 11,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 12,
            "text": "low"
          },
          {
            "char": 13,
            "line": 12,
            "text": "4"
          },
          {
            "char": 17,
            "line": 12,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 13,
            "text": "low"
          },
          {
            "char": 13,
            "line": 13,
            "text": "5"
          },
          {
            "char": 17,
            "line": 13,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 14,
            "text": "jmp"
          },
          {
            "char": 13,
            "line": 14,
            "text": "s"
          },
          {
            "char": 17,
            "line": 14,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 15,
            "text": "m1"
          },
          {
            "char": 11,
            "line": 15,
            "text": ":"
          },
          {
            "char": 13,
            "line": 15,
            "text": "\n"
          },
          {
            "char": 17,
            "line": 16,
            "text": "cmp"
          },
          {
            "char": 21,
            "line": 16,
            "text": "b1"
          },
          {
            "char": 23,
            "line": 16,
            "text": ","
          },
          {
            "char": 25,
            "line": 16,
            "text": "166"
          },
          {
            "char": 30,
            "line": 16,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 17,
            "text": "jnc"
          },
          {
            "char": 13,
            "line": 17,
            "text": "m2"
          },
          {
            "char": 18,
            "line": 17,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 18,
            "text": "low"
          },
          {
            "char": 13,
            "line": 18,
            "text": "3"
          },
          {
            "char": 17,
            "line": 18,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 19,
            "text": "high"
          },
          {
            "char": 14,
            "line": 19,
            "text": "4"
          },
          {
            "char": 18,
            "line": 19,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 20,
            "text": "low"
          },
          {
            "char": 13,
            "line": 20,
            "text": "5"
          },
          {
            "char": 17,
            "line": 20,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 21,
            "text": "jmp"
          },
          {
            "char": 13,
            "line": 21,
            "text": "s"
          },
          {
            "char": 17,
            "line": 21,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 22,
            "text": "m2"
          },
          {
            "char": 11,
            "line": 22,
            "text": ":"
          },
          {
            "char": 13,
            "line": 22,
            "text": "\n"
          },
          {
            "char": 17,
            "line": 23,
            "text": "low"
          },
          {
            "char": 21,
            "line": 23,
            "text": "3"
          },
          {
            "char": 25,
            "line": 23,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 24,
            "text": "low"
          },
          {
            "char": 13,
            "line": 24,
            "text": "4"
          },
          {
            "char": 17,
            "line": 24,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 25,
            "text": "high"
          },
          {
            "char": 14,
            "line": 25,
            "text": "5"
          },
          {
            "char": 18,
            "line": 25,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 26,
            "text": "jmp"
          },
          {
            "char": 13,
            "line": 26,
            "text": "s"
          },
          {
            "char": 17,
            "line": 26,
            "text": "\n"
          },
          {
            "char": 9,
            "line": 27,
            "text": "end"
          },
          {
            "char": 12,
            "line": 27,
            "text": "\n"
          }
        ]
    },
    {
      input: "",
      output: [
        {
          "char": 1,
          "line": 1,
          "text": "\n"
        }
      ]
    },
    {
      input: "asdf sdds asd asd asd asd\n",
      output: [
        {
          "char": 1,
          "line": 1,
          "text": "asdf"
        },
        {
          "char": 6,
          "line": 1,
          "text": "sdds"
        },
        {
          "char": 11,
          "line": 1,
          "text": "asd"
        },
        {
          "char": 15,
          "line": 1,
          "text": "asd"
        },
        {
          "char": 19,
          "line": 1,
          "text": "asd"
        },
        {
          "char": 23,
          "line": 1,
          "text": "asd"
        },
        {
          "char": 26,
          "line": 1,
          "text": "\n"
        }
      ]
    },
    {
      input: "test123",
      output: [
        {
          "char": 1,
          "line": 1,
          "text": "test123"
        },
        {
          "char": 8,
          "line": 1,
          "text": "\n"
        }
      ]
    },
    {
      input: "STRING \"HALLO EIN COOLER; STRING \"\n",
      output: [
        {
          "char": 1,
          "line": 1,
          "text": "STRING"
        },
        {
          "char": 8,
          "line": 1,
          "text": "HALLO EIN COOLER; STRING "
        },
        {
          "char": 9,
          "line": 1,
          "text": "\n"
        }
      ]
    }
  ];

  QUnit.cases(lexer_cases).test("ensure lexer working", function (params) {
    // arrange
    var lexer = new yasp.Lexer();
    var expectedResult = params.output;
    var result;

    // act
    result = JSON.parse(JSON.stringify(lexer.pass({ }, params.input)));

    // assert
    deepEqual(result, expectedResult);
  });
})();

(function () {
  module("assembler token");
  test("ensure token constructor working", function () {
    ok(!!new yasp.Token("test", 0, 0));
  });

  var tokentype_cases = [
    {text: "MOV", type: yasp.TokenType.COMMAND},
    {text: "asdf12_3", type: yasp.TokenType.LABEL},
    {text: "&as??", type: yasp.TokenType.UNKNOWN},
    {text: "123", type: yasp.TokenType.NUMBER},
    {text: "0xFF", type: yasp.TokenType.NUMBER},
    {text: "1234", type: yasp.TokenType.NUMBER},
    {text: "0xFFFF", type: yasp.TokenType.NUMBER},
    {text: "b31", type: yasp.TokenType.BYTE_REGISTER},
    {text: "w15", type: yasp.TokenType.WORD_REGISTER}
  ];

  QUnit.cases(tokentype_cases).test("ensure token getType working", function (params) {
    equal(new yasp.Token(params.text).getType(), params.type);
  });
})();