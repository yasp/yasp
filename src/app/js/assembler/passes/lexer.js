if (typeof yasp == "undefined") yasp = { };

(function() {
    var splitter = " \t,\n;:";
    var deadSplitter = " \t";
    var commentSplitter = ';';

    /**
     * @class Tokenizes (= Lexer) all the tokens
     */
    yasp.Lexer = function() {
        this.tokens = [];
    };

    /**
     * Does the tokenize step
     * @param assembler The assembler in which it is executed
     * @param input What should be tokenized?
     * @returns {Array}
     */
    yasp.Lexer.prototype.pass = function(assembler, input) {
        var lastFound = 0;
        var line = 0;
        var char = 0;

        for (var i = 0; i < input.length; i++) {
            var token = input.charAt(i);
            if (splitter.indexOf(token) != -1) {
                var text = input.substring(lastFound, i);
                this.newToken(new yasp.Token(text, line, char - text.length));

                if (token == commentSplitter) {
                    while (input.charAt(i) != '\n' && i < input.length) i++;
                } else {
                    this.newToken(new yasp.Token(token, line, char));
                }

                lastFound = i + 1;
            }

            char++;
            if (input.charAt(i) == '\n') {
                line++;
                char = 0;
            }
        }
        if (lastFound < input.length) {
            var text = input.substring(lastFound, i);
            this.newToken(new yasp.Token(text, line, char - text.length));
        }

        return this.tokens;
    };

    /**
     * Creates a new token and adds it to the token array list
     * If the token is either empty or in the deadSplitter array it is not added to the array
     * @param token Which token should be added
     */
    yasp.Lexer.prototype.newToken = function(token) {
        if (!!token && token.text.length > 0 && deadSplitter.indexOf(token.text) == -1) {
            this.tokens.push(token);
        }
    };

    /**
     * A Token representing an atomic group of characters in the assembler code
     * @param text The content of the token
     * @param line The line in which this token is (used for error messages)
     * @param char The character where exactly this token is (used for error messages)
     * @constructor
     */
    yasp.Token = function(text, line, char) {
        this.text = text;
        this.line = line;
        this.char = char;
    };

    /**
     * @function Returns the type of this Token (Literal, Label, ...)
     */
    yasp.Token.prototype.getType = function() {
        // TODO Implement this
        return "UNKNOWN";
    };

    /**
     * Returns the string representation of a token. This should only be used for testing purpose
     * @returns {string}
     */
    yasp.Token.prototype.toString = function() {
        return "'" + (this.text == '\n' ? "NEWLINE" : this.text) + "'\n";
    };
})();