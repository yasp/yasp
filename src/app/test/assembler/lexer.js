(function() {
    module("assembler lexer");
    var lexer_cases = [
        {
            input: '; ADC-Werte: \n                ;   0 ...  80 => rote LED leuchtet \n        ;  81 ... 165 => gelbe LED leuchtet \n        ; 166 ... 255 => grüne LED leuchtet \n        ; ================================= \n        s: \n                adc1 w0		; Wert von Poti einlesen \n        debug b1	; brauchbaren Teil zum Vergleichen ausgeben \n        cmp b1, 81	; auf erste Grenze testen \n        jnc m1		; wenn größer oder gleich dann weiter springen \n        high 3		; erste LED setzen \n        low 4		; zweite LED löschen \n        low 5		; dritte LED löschen \n        jmp s		; endlos \n        m1: \n                cmp b1, 166	; zweite Grenze testen \n        jnc m2		; wenn größer oder gleich dann weiter springen \n        low 3		; erste LED löschen \n        high 4		; zweite LED setzen \n        low 5		; dritte LED löschen \n        jmp s		; endlos \n        m2: \n                low 3		; erste LED löschen \n        low 4		; zweite LED löschen \n        high 5		; dritte LED setzen \n        jmp s		; endlos \n        end\n',
            output: [
                {"text": "s", "line": 5, "char": 8},
                {"text": ":", "line": 5, "char": 9},
                {"text": "\n", "line": 5, "char": 11},
                {"text": "adc1", "line": 6, "char": 16},
                {"text": "w0", "line": 6, "char": 21},
                {"text": "debug", "line": 7, "char": 8},
                {"text": "b1", "line": 7, "char": 14},
                {"text": "cmp", "line": 8, "char": 8},
                {"text": "b1", "line": 8, "char": 12},
                {"text": ",", "line": 8, "char": 14},
                {"text": "81", "line": 8, "char": 16},
                {"text": "jnc", "line": 9, "char": 8},
                {"text": "m1", "line": 9, "char": 12},
                {"text": "high", "line": 10, "char": 8},
                {"text": "3", "line": 10, "char": 13},
                {"text": "low", "line": 11, "char": 8},
                {"text": "4", "line": 11, "char": 12},
                {"text": "low", "line": 12, "char": 8},
                {"text": "5", "line": 12, "char": 12},
                {"text": "jmp", "line": 13, "char": 8},
                {"text": "s", "line": 13, "char": 12},
                {"text": "m1", "line": 14, "char": 8},
                {"text": ":", "line": 14, "char": 10},
                {"text": "\n", "line": 14, "char": 12},
                {"text": "cmp", "line": 15, "char": 16},
                {"text": "b1", "line": 15, "char": 20},
                {"text": ",", "line": 15, "char": 22},
                {"text": "166", "line": 15, "char": 24},
                {"text": "jnc", "line": 16, "char": 8},
                {"text": "m2", "line": 16, "char": 12},
                {"text": "low", "line": 17, "char": 8},
                {"text": "3", "line": 17, "char": 12},
                {"text": "high", "line": 18, "char": 8},
                {"text": "4", "line": 18, "char": 13},
                {"text": "low", "line": 19, "char": 8},
                {"text": "5", "line": 19, "char": 12},
                {"text": "jmp", "line": 20, "char": 8},
                {"text": "s", "line": 20, "char": 12},
                {"text": "m2", "line": 21, "char": 8},
                {"text": ":", "line": 21, "char": 10},
                {"text": "\n", "line": 21, "char": 12},
                {"text": "low", "line": 22, "char": 16},
                {"text": "3", "line": 22, "char": 20},
                {"text": "low", "line": 23, "char": 8},
                {"text": "4", "line": 23, "char": 12},
                {"text": "high", "line": 24, "char": 8},
                {"text": "5", "line": 24, "char": 13},
                {"text": "jmp", "line": 25, "char": 8},
                {"text": "s", "line": 25, "char": 12},
                {"text": "end", "line": 26, "char": 8},
                {"text": "\n", "line": 26, "char": 11}
            ]
        }, {
            input: "",
            output: [ ]
        }, {
            input: "asdf sdds asd asd asd asd\n",
            output: [
                { "char": 0, "line": 0, "text": "asdf" },
                { "char": 5, "line": 0, "text": "sdds" },
                { "char": 10, "line": 0, "text": "asd" },
                { "char": 14, "line": 0, "text": "asd" },
                { "char": 18, "line": 0, "text": "asd" },
                { "char": 22, "line": 0, "text": "asd" },
                { "char": 25, "line": 0, "text": "\n" }
            ]
        }, {
            input: "test123",
            output: [
                { "char": 0, "line": 0, "text": "test123" }
            ]
        }
    ];

    QUnit.cases(lexer_cases).test("ensure lexer working", function(params) {
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