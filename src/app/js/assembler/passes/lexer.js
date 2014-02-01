if (typeof yasp == "undefined") yasp = { };

(function () {
  var splitter = ' \t,\n;:"';
  var deadSplitter = " \t";
  var commentSplitter = ';';
  var stringSplitter = '"';

  var validLabel = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
  var validByteRegisters = [];
  for (var i = 0; i < 32; i++) {
    validByteRegisters.push("B" + i);
  }
  var validWordRegisters = [];
  for (var i = 0; i < 32; i++) {
    validWordRegisters.push("W" + i);
  }
  var validUnknownRegister = /[BW]\d+/;
  
  /**
   * @class Tokenizes (= Lexer) all the tokens
   */
  yasp.Lexer = function () {
    this.tokens = [];
  };

  /**
   * Returns all delimiters as a string
   * @returns {string}
   */
  yasp.Lexer.getDelimiters = function() {
    return splitter;
  };

  /**
   * Returns all registers as an array
   */
  yasp.Lexer.getRegisters = function() {
    return validByteRegisters.slice(0).concat(validWordRegisters);
  }

  /**
   * Does the tokenize step
   * @param assembler The assembler in which it is executed, this parameter is completely ignored
   * @param input What should be tokenized?
   * @returns {Array}
   */
  yasp.Lexer.prototype.pass = function (assembler, input) {
    var lastFound = 0;
    var line = 1;
    var char = 1;

    for (var i = 0; i < input.length; i++) {
      var token = input.charAt(i);
      if (splitter.indexOf(token) != -1) {
        var text = input.substring(lastFound, i);
        this.newToken(new yasp.Token(text, line, char - text.length));

        if (token == commentSplitter) {
          while (input.charAt(i) != '\n' && i < input.length) i++;
          i--;
        } else if (token == stringSplitter) {
          token = "";
          i++;
          while ((input.charAt(i) != '"' && input.charAt(i) != '\n') && i < input.length) {
            token += input.charAt(i);
            i++;
          }
          token = '"' + token + '"';
          this.newToken(new yasp.Token(token, line, char));
        } else {
          this.newToken(new yasp.Token(token, line, char));
        }

        lastFound = i + 1;
      }

      char++;
      if (input.charAt(i) == '\n') {
        line++;
        char = 1;
      }
    }
    if (lastFound < input.length) {
      var text = input.substring(lastFound, i);
      this.newToken(new yasp.Token(text, line, char - text.length));
    }
    if (this.tokens.length == 0 || this.tokens[this.tokens.length - 1].text != '\n') this.newToken(new yasp.Token("\n", line, char));

    return this.tokens;
  };

  /**
   * Creates a new token and adds it to the token array list
   * If the token is either empty or in the deadSplitter array it is not added to the array
   * @param token Which token should be added
   */
  yasp.Lexer.prototype.newToken = function (token) {
    if (!!token && token.text.length > 0 && deadSplitter.indexOf(token.text) == -1) {
      this.tokens.push(token);
    }
  };

  yasp.TokenType = {
    COMMAND: "command",
    LABEL: "label",
    NUMBER: "number", // pin / byte_literal / word_literal
    NEGATIVE_NUMBER: "negative number", // -42 for example
    BYTE_REGISTER: "byte register",
    WORD_REGISTER: "word register",
    DIRECTIVE: "directive",
    UNKNOWN_REGISTER: "unknown register",
    UNKNOWN: "unknown",
    DELIMITER: "delimiter",
    STRING: "string"
  };

  /**
   * A Token representing an atomic group of characters in the assembler code
   * @param text The content of the token
   * @param line The line in which this token is (used for error messages)
   * @param char The character where exactly this token is (used for error messages)
   * @constructor
   */
  yasp.Token = function (text, line, char) {
    this.text = text;
    this.line = line;
    this.char = char;
  };

  /** Returns the type of this Token (Literal, Label, ...)
   */
  yasp.Token.prototype.getType = function () {
    // TODO: optimize this function => cache values and dont iterate through everything
    var name = this.text.toUpperCase();

    if (!isNaN(parseFloat(name)) && isFinite(name)) {
      var num = +name;
      if (num < 0) {
        return yasp.TokenType.NEGATIVE_NUMBER;
      } else {
        return yasp.TokenType.NUMBER;
      }
    }
    
    // am i a string
    if (name.charAt(0) == '"' && name.charAt(name.length-1) == '"') {
      return yasp.TokenType.STRING;
    }
    
    // am i a byte register
    for (var i = 0; i < validByteRegisters.length; i++) {
      if (validByteRegisters[i] == name) return yasp.TokenType.BYTE_REGISTER;
    }

    // am i a word register
    for (var i = 0; i < validWordRegisters.length; i++) {
      if (validWordRegisters[i] == name) return yasp.TokenType.WORD_REGISTER;
    }
    
    // am i a directive
    switch (name) {
      case "DEFINE":
      case "ORG":
      case "STRING":
      case "DB":
      case "DA":
      case "DW":
      case "END":
        return yasp.TokenType.DIRECTIVE;
    }

    // am i a command?
    for (var i = 0; i < yasp.commands.length; i++) {
      if (yasp.commands[i].name instanceof Array) {
        for (var j = 0; j < yasp.commands[i].name.length; j++) {
          if (yasp.commands[i].name[j].toUpperCase() == name) return yasp.TokenType.COMMAND;
        }
      } else {
        if (yasp.commands[i].name.toUpperCase() == name) return yasp.TokenType.COMMAND;
      }
    }
    
    // am i an unknown register
    var unknownRegister = validUnknownRegister.exec(name)
    if (unknownRegister != null && unknownRegister.length > 0) {
      return yasp.TokenType.UNKNOWN_REGISTER + "[" + name + "]";
    }

    // am i a label?
    var amILabel = true;
    for (var i = 0; i < this.text.length; i++) {
      if (validLabel.indexOf(name.charAt(i)) == -1) {
        amILabel = false;
        break;
      }
    }
    
    // am i a delimiter?
    if (splitter.indexOf(name) != -1) {
      return yasp.TokenType.DELIMITER;
    }
    
    return amILabel ? yasp.TokenType.LABEL : yasp.TokenType.UNKNOWN;
  };

  /**
   * Returns the string representation of a token. This should only be used for testing purpose
   * @returns {string}
   */
  yasp.Token.prototype.toString = function () {
    return "'" + (this.text == '\n' ? "↵" : this.text) + "'";
  };
})();