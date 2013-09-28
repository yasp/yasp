if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * parses the code
   * @constructor
   */
  yasp.Parser = function () {
    this.nodes = [ ];
  };

  /**
   * This function does all the parsing magic
   * @param assembler
   * @param input
   * @returns {*}
   */
  yasp.Parser.prototype.pass = function (assembler, input) {
    this.nodes = [ ];
    
    var iterator = new yasp.TokenIterator(assembler, input);

    iterator.iterate((function() {
      var type;
      switch (type = iterator.current().getType()) {
        case yasp.TokenType.COMMAND:
          this.parseCommand(iterator);
          break;
        case yasp.TokenType.LABEL:
          this.parseLabel(iterator);
          break;
        default:
          iterator.riseSyntaxError("Expecting command or label, got " + type + " instead.");
      }
    }).bind(this));

    return this.nodes;
  };

  /**
   * This method parses a command (like MOV, PUSH, ...) => generates AST for these commands. if it does not know the command it raises a syntax error.
   * If the command + parameter definition is not unique parseCommand takes the first hit, so keep this in mind.
   * @param iterator
   * @param opt If this is true, no error is rised if the current token is no command. Default is false.
   */
  yasp.Parser.prototype.parseCommand = function (iterator, opt) {
    if (typeof opt == 'undefined') opt = false;

    var type;
    if ((type = iterator.current().getType()) == yasp.TokenType.COMMAND) {
      var name = iterator.current().text.toUpperCase();
      var command = null;
      var params = null;
      var commandToken = iterator.current();
      iterator.next();
      
      for (var i = 0; i < yasp.commands.length; i++) {
        if (yasp.commands[i].name.toUpperCase() == name) {
          command = yasp.commands[i];
          var oldPos = iterator.pos;
          var itsMe = true;
          var paramPos = 0;
          var start = true;          
          params = [ ];
          
          while (!iterator.is('\n') && itsMe) {
            if (!start) {
              iterator.match(",");
            }
            var cur = iterator.current();
            params.push(cur);
            
            var paramType = command.params[paramPos].type;
            
            switch (paramType) {
              case "r_byte":
                if (cur.getType() != yasp.TokenType.BYTE_REGISTER) {
                  itsMe = false;
                }
                break;
              case "r_word":
                if (cur.getType() != yasp.TokenType.WORD_REGISTER) {
                  itsMe = false;
                }
                break;
              case "l_byte":
                if (cur.getType() != yasp.TokenType.NUMBER || +cur.text >= Math.pow(2, 8)) {
                  itsMe = false;
                }
                break;
              case "l_word":
                if (cur.getType() != yasp.TokenType.NUMBER || +cur.text >= Math.pow(2, 16)) {
                  itsMe = false;
                }
                break;
              case "pin":
                if (cur.getType() != yasp.TokenType.NUMBER || +cur.text >= Math.pow(2, 5)) {
                  itsMe = false;
                }
                break;
              case "address":
                if (cur.getType() != yasp.TokenType.LABEL || !iterator.assembler.getLabel(cur.text)) {
                  itsMe = false;
                }
                break;
              default:
                iterator.riseSyntaxError("Internal error (unknown paramter type " + paramType);
            }
            
            iterator.next();
            start = false;
            paramPos++;
          }
          
          if (!itsMe || paramPos != command.params.length) {
            // nope, its not me
            iterator.pos = oldPos;
            command = null;
          } else {
            break;
          }
        }
      }
      if (!command) {
        // build parameters
        var parameters = "";
        var start = true;
        while (!iterator.is('\n')) {
          if (!start) {
            iterator.match(",");
            parameters += ", ";
          }
          var cur = iterator.current();
          parameters += cur.getType();
          iterator.next();
          start = false;
        }
        iterator.riseSyntaxError("Unknown command " + name + "(" + parameters + ")");
      } else {
        // build AST
        var node = new yasp.AstNode(yasp.AstNodeTypes.NODE_COMMAND, commandToken, {
          command: command,
          params: params
        });
        this.nodes.push(node);
      }
    } else if (!opt) {
      iterator.riseSyntaxError("Expecting command, got " + type + " instead");
    }
  };

  /**
   * This method parses a label (myLabel: ) => only syntactical correctness
   * @param iterator
   * @param opt If this is true, no error is rised if the current token is no command. Default is false.
   */
  yasp.Parser.prototype.parseLabel = function (iterator, opt) {
    if (typeof opt == 'undefined') opt = false;

    var type;
    if ((type = iterator.current().getType()) == yasp.TokenType.LABEL) {
      var current = iterator.current();
      iterator.next();
      iterator.match(":");
      
      var node = new yasp.AstNode(yasp.AstNodeTypes.NODE_LABEL, current, {
        label: iterator.assembler.getLabel(current.text)
      });
      this.nodes.push(node);

      this.parseCommand(iterator, true); // optionally there can be a command
    } else if (!opt) {
      iterator.riseSyntaxError("Expecting label, got " + type + " instead");
    }
  };
})();