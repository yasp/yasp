if (typeof yasp == 'undefined') yasp = { };

(function() {
    /**
     * Checks the code for syntactic correctness
     * @constructor
     */
    yasp.Checker = function() {

    };

    /**
     * This does function does all the checking magic
     * @param assembler
     * @param input
     * @returns {*}
     */
    yasp.Checker.prototype.pass = function(assembler, input) {
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
            } catch (ex) {
                iterator.restore(); // error occured => try to make state consistent again
            }

            do {
                iterator.match('\n');
            } while (iterator.is('\n'));
        }

        return input;
    }

    /**
     * This method checks a command (like MOV, PUSH, ...)
     * @param iterator
     * @param opt If this is true, no error is rised if the current token is no command. Default is false.
     */
    yasp.Checker.prototype.parseComand = function(iterator, opt) {
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
            iterator.next();
            for (var i = 0; i< command.params.length; i++) {
                var param = command.params[i];

                var type = iterator.current().getType();
                switch(param.type) {
                    case "r_byte":
                        if (type != yasp.TokenType.BYTE_REGISTER) {
                            iterator.riseSyntaxError("Invalid parameter: expecting byte register, got "+type);
                        }
                        break;
                    case "r_word":
                        if (type != yasp.TokenType.WORD_REGISTER) {
                            iterator.riseSyntaxError("Invalid parameter: expecting byte register, got "+type);
                        }
                        break;
                    case "l_byte":
                        if (type != yasp.TokenType.WORD_REGISTER) {
                            iterator.riseSyntaxError("Invalid parameter: expecting byte literal, got "+type);
                        }
                        break;
                    case "l_word":
                        if (type != yasp.TokenType.WORD_REGISTER) {
                            iterator.riseSyntaxError("Invalid parameter: expecting word literal, got "+type);
                        }
                        break;
                    case "pin":
                        // TODO: implement proper checking (instead of expecting bytes, it should check pin value)
                        if (type != yasp.TokenType.BYTE_LITERAL) {
                            iterator.riseSyntaxError("Invalid parameter: expecting byte literal, got "+type);
                        }
                        break;
                    case "address":
                        if (type != yasp.TokenType.LABEL) {
                            iterator.riseSyntaxError("Invalid parameter: expecting label, got "+type);
                        }
                        break;
                    default:
                        iterator.riseSyntaxError("Internal error (unknown parameter type)");
                }
                if (i != command.params.length - 1) {
                    iterator.match(",");
                }
            }
        } else if (!opt) {
            iterator.riseSyntaxError("Expecting label, got "+type+" instead");
        }
    }

    /**
     * This method checks a label (myLabel: )
     * @param iterator
     * @param opt If this is true, no error is rised if the current token is no command. Default is false.
     */
    yasp.Checker.prototype.parseLabel = function(iterator, opt) {
        if (typeof opt == 'undefined') opt = false;

        var type;
        if ((type = iterator.current().getType()) == yasp.TokenType.LABEL) {
            iterator.next();
            iterator.match(":");

            this.parseComand(iterator, true); // optionally there can be a command
        } else if(!opt) {
            iterator.riseSyntaxError("Expecting label, got "+type+" instead");
        }
    }
})();