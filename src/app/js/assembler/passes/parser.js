if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * parses the code
   * @constructor
   */
  yasp.Parser = function () {
    this.nodes = [ ];
    this.input = "";
  };

  /**
   * This function does all the parsing magic
   * @param assembler
   * @param input
   * @returns {*}
   */
  yasp.Parser.prototype.pass = function (assembler, input) {
    this.nodes = [ ];
    this.input = input;
    
    var iterator = new yasp.TokenIterator(assembler, this.input);
    
    iterator.iterate((function() {
      var type;
      switch (type = iterator.current().getType()) {
        case yasp.TokenType.COMMAND:
          this.parseCommand(iterator);
          break;
        case yasp.TokenType.LABEL:
          this.parseLabel(iterator);
          break;
        case yasp.TokenType.DIRECTIVE:
          this.parseDirective(iterator);
          break;
        default:
          iterator.riseSyntaxError("Expecting command, directive or label, got " + type + " instead.");
      }
    }).bind(this));

    // generate symbol table
    if (assembler.jobs.indexOf("symbols") != -1 && assembler.getFatalErrorCount() == 0) {
      // labels are already generated in the Analyser
      // defines are generated in Analyser
      // usedRegisters & instructions
      var registers = { };
      assembler.symbols.instructions = { };
      assembler.symbols.usedRegisters = { };
      for (var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        if (node.type == yasp.AstNodeTypes.NODE_COMMAND) {
          var name = (node.params.command.name instanceof Array) ? node.params.command.name[0] : node.params.command.name;
          
          if (!!assembler.symbols.instructions[name]) {
            assembler.symbols.instructions[name]++;
          } else {
            assembler.symbols.instructions[name] = 1;
          }
          
          // params
          for (var j = 0; j < node.params.params.length; j++) {
            var param = node.params.params[j];
            var typ = param.getType();
            var paramName = param.text.toUpperCase();
            if (typ == yasp.TokenType.BYTE_REGISTER || typ == yasp.TokenType.WORD_REGISTER) {
              if (!!assembler.symbols.usedRegisters[paramName]) {
                assembler.symbols.usedRegisters[paramName]++;
              } else {
                assembler.symbols.usedRegisters[paramName] = 1;
              }
            }
          }
        }
      }
    }
    
    // set AST
    if (assembler.jobs.indexOf("ast") != -1) {
      assembler.ast = JSON.parse(JSON.stringify(this.nodes));
    }
    
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
      var possibleCommands = [ ];
      iterator.next();
      if (iterator.is(":")) {
        iterator.riseSyntaxError("Command cannot be a label.");
      }
      
      for (var i = 0; i < yasp.commands.length; i++) {
        var commandName;
        if (yasp.commands[i].name instanceof Array) {
          commandName = yasp.commands[i].name[0];
          for (var j = 0; j < yasp.commands[i].name.length; j++) {
            if (yasp.commands[i].name[j].toUpperCase() == name) {
              commandName = yasp.commands[i].name[j];
              break;
            }
          }
        } else {
          commandName = yasp.commands[i].name;
        }
        
        if (commandName.toUpperCase() == name) {
          command = yasp.commands[i];
          
          var oldPos = iterator.pos;
          var itsMe = true;
          var paramPos = 0;
          var start = true;          
          params = [ ];
          
          while (!(iterator.is('\n') || !iterator.hasNext()) && itsMe) {
            if (paramPos >= command.params.length) {
              // too many parameters
              itsMe = false;
              break;
            }
            
            if (!start) {
              iterator.match(",");
            }
            var cur = iterator.current();
            params.push(cur);
            
            var paramType = command.params[paramPos].type;
            var param = yasp.ParamType[paramType.toLowerCase()];
            if (!!param) {
              itsMe = param.check(cur, iterator.assembler);
            } else {
              iterator.riseSyntaxError("Internal error (unknown paramter type " + paramType + ")");
            }
            
            iterator.optNext();
            start = false;
            paramPos++;

            if (!!cur && cur.getType() == 'delimiter') break;
          }
          
          if (!itsMe || paramPos != command.params.length) {
            // nope, its not me
            // but could it still be?
            var typ = !!cur ? cur.getType() : "";
            if ((paramPos < command.params.length || (typ == 'delimiter' && paramPos - 1 < command.params.length)) && (itsMe || typ == 'delimiter')) {
              possibleCommands.push(command);
            }
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
        var last = null;
        var parameterArray = [ ];
        while (!iterator.is('\n') && iterator.hasNext()) {
          if (!start) {
            if (iterator.is(',')) {
              iterator.match(",");
            } else {
              iterator.optNext();
            }
            parameters += ", ";
          }
          var cur = iterator.current();
          parameterArray.push(cur);
          var typ = cur.getType();
          
          if (!!last && typ == yasp.TokenType.NUMBER ) {
            var num = +cur.text;
            if (num >= Math.pow(2, 8) && last.getType() == yasp.TokenType.BYTE_REGISTER) typ += "[too big for byte register]";
            if (num >= Math.pow(2, 16) && last.getType() == yasp.TokenType.WORD_REGISTER) typ += "[too big for word register]";
          }
          
          // unknown label?
          if (typ == yasp.TokenType.LABEL && !iterator.assembler.getLabel(cur.text)) {
            typ += "[unknown label address]"; // shit
          }
          
          parameters += typ;
          last = cur;
          iterator.optNext();
          start = false;
        }
        
        if (possibleCommands.length > 0) {
          var node = new yasp.AstNode(yasp.AstNodeTypes.NODE_UNKNOWNCOMMAND, commandToken, {
            possibleCommands: possibleCommands,
            params: parameterArray
          });
          this.nodes.push(node);
          
          if (iterator.is(',')) iterator.next(); // skip ","
        }
        
        iterator.riseSyntaxError("Unknown command " + name + "(" + parameters + ")", possibleCommands.length > 0 ? "minor" : "error");
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
      
      if (iterator.current().getType() == yasp.TokenType.DIRECTIVE) {
        this.parseDirective(iterator, true)
      } else {
        this.parseCommand(iterator, true); // optionally there can be a command
      }
    } else if (!opt) {
      iterator.riseSyntaxError("Expecting label, got " + type + " instead");
    }
  };

  /**
   * This method parses ALL THE directives!
   * @param iterator
   */
  yasp.Parser.prototype.parseDirective = function(iterator, opt) {
    if (typeof opt == 'undefined') opt = false;
    
    switch(iterator.current().text.toUpperCase()) {
      case "DEFINE":
        // skip DEFINE
        iterator.next();
        var from = iterator.current().text.toUpperCase();
        var fromToken = iterator.current();
        iterator.next();
        var to = iterator.current().text.toUpperCase();
        iterator.optNext();
        break;
      case "ORG":
        var cur = iterator.current();
        iterator.next();
        if (iterator.current().getType() != yasp.TokenType.NUMBER) {
          iterator.riseSyntaxError("Invalid parameter for ORG - can only be numeric :(");
        }
        this.nodes.push(new yasp.AstNode(yasp.AstNodeTypes.NODE_ORG, cur, {
          len: +iterator.current().text
        }));
        iterator.optNext();
        break;
      case "STRING":
        var cur = iterator.current();
        do {
          iterator.next();
          if (iterator.current().getType() != yasp.TokenType.STRING) iterator.riseSyntaxError("STRING expects string value");
          
          this.nodes.push(new yasp.AstNode(yasp.AstNodeTypes.NODE_DUMP, cur, {
            data: new String(iterator.current().text)
          }));
          iterator.optNext();
        } while (iterator.is(','));
        
        break;
      case "DB":
        var cur = iterator.current();
        do {
          iterator.next();
          var val = +iterator.current().text;
          if (isNaN(val)) iterator.riseSyntaxError("Expecting number.");
          if (val < 0 || val >= Math.pow(2, 8)) iterator.riseSyntaxError("Invalid number [0,2^8]");
          this.nodes.push(new yasp.AstNode(yasp.AstNodeTypes.NODE_DUMP, cur, {
            data: val,
            len: 8
          }));
          iterator.optNext();
        } while (iterator.is(','));
        
        break;
      case "DA":
        var cur = iterator.current();
        do {
          iterator.next();
          var val = iterator.current().text;
          var label;
          if (!(label = iterator.assembler.getLabel(val))) {
            iterator.riseSyntaxError("Unknown label "+label);
          }
          
          this.nodes.push(new yasp.AstNode(yasp.AstNodeTypes.NODE_DUMP, cur, {
            data: new String(val),
            len: 16
          }));
          iterator.optNext();
        } while (iterator.is(','));
        
        break;
      case "DW":
        var cur = iterator.current();
        do {
          iterator.next();
          var val = +iterator.current().text;
          if (isNaN(val)) iterator.riseSyntaxError("Expecting number.");
          if (val < 0 || val >= Math.pow(2, 16)) iterator.riseSyntaxError("Invalid number [0,2^16]");
          this.nodes.push(new yasp.AstNode(yasp.AstNodeTypes.NODE_DUMP, cur, {
            data: val,
            len: 16
          }));
          iterator.optNext();
        } while (iterator.is(','));
        
        break;
      case "END":
        while(iterator.hasNext()) {
          iterator.next();
        }
        break;
      default:
        if (!opt) iterator.riseSyntaxError("Expecting directive, got "+iterator.current().getType() + " instead");
    }
  };
})();