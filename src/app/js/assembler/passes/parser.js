if (typeof yasp == 'undefined') yasp = { };

(function() {
    /**
     * parses the code
     * @constructor
     */
    yasp.Parser = function() {

    };

    /**
     * This function does all the parsing magic
     * @param assembler
     * @param input
     * @returns {*}
     */
    yasp.Parser.prototype.pass = function(assembler, input) {
        var iterator = new yasp.TokenIterator(assembler, input);

        while (iterator.hasNext()) {
            // is command?
            try {
                var type;
                switch(type = iterator.current().getType()) {
                    case yasp.TokenType.COMMAND:
                        this.parseCommand(iterator);
                        break;
                    case yasp.TokenType.LABEL:
                        this.parseLabel(iterator);
                        break;
                    default:
                        iterator.riseSyntaxError(iterator, "Expecting command or label, got "+type+" instead.");
                }

                if (iterator.hasNext()) {
                    do {
                        iterator.match('\n');
                    } while (iterator.is('\n'));
                }
            } catch (ex) {
                iterator.restore(); // error occured => try to make state consistent again
            }
        }

        return input;
    };

    /**
     * This method parses a command (like MOV, PUSH, ...) but only syntactiv correctness (no datatype parses are performed)
     * @param iterator
     * @param opt If this is true, no error is rised if the current token is no command. Default is false.
     */
    yasp.Parser.prototype.parseCommand = function(iterator, opt) {
        if (typeof opt == 'undefined') opt = false;

        var type;
        if ((type = iterator.current().getType()) == yasp.TokenType.COMMAND) {
            var name = iterator.current().text.toUpperCase();
            var command = null;
            for (var i = 0; i < yasp.commands.length; i++) {
                if (yasp.commands[i].name.toUpperCase() == name) {
                    command = yasp.commands[i];
                    break;
                }
            }
            if (!command) iterator.riseSyntaxError("Unknown command "+name);
            iterator.next();

            var start = true;
            while(!iterator.is('\n')) {
                if (!start) {
                    iterator.match(",");
                }
                iterator.next();
                start = false;
            }
        } else if (!opt) {
            iterator.riseSyntaxError("Expecting command, got "+type+" instead");
        }
    };

    /**
     * This method parses a label (myLabel: )
     * @param iterator
     * @param opt If this is true, no error is rised if the current token is no command. Default is false.
     */
    yasp.Parser.prototype.parseLabel = function(iterator, opt) {
        if (typeof opt == 'undefined') opt = false;

        var type;
        if ((type = iterator.current().getType()) == yasp.TokenType.LABEL) {
            iterator.next();
            iterator.match(":");

            this.parseCommand(iterator, true); // optionally there can be a command
        } else if(!opt) {
            iterator.riseSyntaxError("Expecting label, got "+type+" instead");
        }
    };
})();