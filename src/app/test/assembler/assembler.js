(function() {
    var tokens = [
        {text: "A"},
        {text: "B"},
        {text: "\n"}
    ];
    var iterator;
    module("assembler tokeniterator", {
        setup: function() {
            var assemblerMockup = {
                riseSyntaxError: function() {
                    throw "Syntax error";
                }
            };

            iterator = new yasp.TokenIterator(assemblerMockup, tokens);
        },
        teardown: function() {
            iterator = null;
        }
    });
    test("ensure tokeniterator match working", function() {
        ok(iterator.match("A").text == "B");
    });
    test("ensure tokeniterator match not working", function() {
        throws(function() {
            iterator.match("B");
        });
    });

    test("ensure tokeniterator is working", function() {
        ok(iterator.is("A") == true);
    });

    test("ensure tokeniterator next working", function() {
        ok(iterator.next().text == "B");
    });
    test("ensure tokeniterator next not working", function() {
        throws(function() {
            iterator.next();
            iterator.next();
            iterator.next();
        });
    });

    test("ensure tokeniterator current working", function() {
        ok(iterator.current().text == "A");
    });

    test("ensure tokeniterator hasNext working", function() {
        ok(iterator.hasNext());
    });

    test("ensure tokeniterator hasNext not working", function() {
        iterator.next();
        iterator.next();
        ok(!iterator.hasNext());
    });

    test("ensure tokeniterator restore working", function() {
        iterator.restore();
        ok(!iterator.hasNext());
    });
})();

(function() {
    // TODO: test assembler end2end
})();
