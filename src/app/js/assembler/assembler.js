if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * Assembler is responsible for generating the bytecode from the assembler
   * @constructor
   */
  yasp.Assembler = function () {
    this.jobs = null;
    this.errors = null; // array containing all the errors that occured while assembling
    this.map = null;
    this.symbols = null;
    this.passes = null;
    
    this.reset();
  };

  /**
   * Resets state of Assembler (does assemble() automatically)
   */
  yasp.Assembler.prototype.reset = function() {
    this.passes = [
      new yasp.Lexer(),
      new yasp.Analyser(),
      new yasp.Parser(),
      new yasp.Generator()
    ];

    this.symbols = {
      labels: { },
      usedRegisters: { },
      defines: { },
      instructions: { }
    };
    this.errors = [ ]; // array containing all the errors that occured while assembling
    this.map = { };
    this.jobs = [ ];
  }

  /**
   * @function Assembles the files
   */
  yasp.Assembler.prototype.assemble = function (params) {
    this.reset();
    
    this.jobs = params.jobs;
    
    try {
      var tmpResult = params.code;
      for (var i = 0; i < this.passes.length; i++) {
        tmpResult = this.passes[i].pass(this, tmpResult);
      }
    } catch (ex) {
      // houston we have a problem!
      if (this.errors.length == 0) {
        // really a problem
        throw ex;
      }
    }
    var result;
    
    if (this.errors.length == 0) {
      result = {
        success: true,
        bitcode: this.jobs.indexOf('bitcode') != -1 ? tmpResult : null,
        symbols: this.jobs.indexOf('symbols') != -1 ? this.symbols : null,
        map: this.jobs.indexOf('map') != -1 ? this.map : null
      };
    } else {
      // assembler errors
      var errors = [ ];
      for (var i = 0; i < this.errors.length; i++) {
        var err = this.errors[i];
        errors.push({
          type: err.type,
          name: "E_ERR",
          line: err.token.line,
          char: err.token.char,
          message: err.msg.replace('\n', '↵')
        });
      }
      
      result = {
        success: false,
        errors: errors
      };
    }
    
    return result;
  };

  /**
   * @function Rises a syntax error
   */
  yasp.Assembler.prototype.riseSyntaxError = function (iterator, msg) {
    var token = iterator.current();
    console.log("Syntax error: " + msg + " in line " + token.line + " at character " + token.char);
    this.errors.push({
      token: token,
      msg: msg,
      type: "error"
    });

    throw msg;
  };

  /**
   * Returns the label with the name
   */
  yasp.Assembler.prototype.getLabel = function(label) {
    return !!this.symbols.labels ? this.symbols.labels[label.toUpperCase()] : null;
  };
  
  /**
   * Creates an iterator that iterates through a token array.
   * It also features some useful methods
   * @param tokens
   * @constructor
   */
  yasp.TokenIterator = function (assembler, tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.assembler = assembler;
  };

  /**
   * Matches the current token with the specified text, if it fails an error is raised
   * @param text
   * @returns {*}
   */
  yasp.TokenIterator.prototype.match = function (text) {
    if (this.is(text)) {
      return this.next();
    } else {
      this.assembler.riseSyntaxError(this, "Unexpected token " + this.current().toString() + ", expecting '" + text + "'");
    }
  };

  /**
   * Checks whether the current token equals the given text.
   * @param text
   * @returns {boolean}
   */
  yasp.TokenIterator.prototype.is = function (text) {
    return this.current().text == text;
  };

  /**
   * Moves to the next token. If there is none, an error is rised.
   */
  yasp.TokenIterator.prototype.next = function () {
    if (this.hasNext()) {
      this.pos++;
      return this.current();
    } else {
      this.assembler.riseSyntaxError(this, "Unexpected end of file");
    }
  };

  /**
   * If there is a next token => next(), otherwise ignore
   */
  yasp.TokenIterator.prototype.optNext = function() {
    if (this.hasNext()) {
      return this.next();
    } else {
      return this.current();
    }
  }

  /**
   * Returns the current token
   * @returns {*}
   */
  yasp.TokenIterator.prototype.current = function () {
    return this.tokens[this.pos];
  };

  /**
   * Returns whether there is a next token or not
   * @returns {boolean}
   */
  yasp.TokenIterator.prototype.hasNext = function () {
    return this.pos + 1 < this.tokens.length
  };

  /**
   * Restores the TokenIterator to the next consistent state (used for multiple error messages)
   */
  yasp.TokenIterator.prototype.restore = function () {
    // restore state => continue until \n is reached, and then skip the \n
    var hasSkipped = false;
    while (this.hasNext() && !this.is('\n')) {
      this.next();
      hasSkipped = true;
    }
    if (this.hasNext()) this.next();
    while (this.hasNext() && this.is('\n')) this.next();
  };

  /**
   * Wrapper for the yasp.Assembler.riseSyntaxError function
   * @param msg
   */
  yasp.TokenIterator.prototype.riseSyntaxError = function (msg) {
    this.assembler.riseSyntaxError(this, msg);
  };

  /**
   * Iterates through the source code
   * @param func Function that is called at the beginning of each line
   */
  yasp.TokenIterator.prototype.iterate = function(func) {
    // if \n skip!!
    while (this.hasNext() && this.is("\n")) this.next();
    
    while (this.hasNext()) {
      try {
        func();

        if (this.hasNext()) {
          do {
            this.match('\n');
          } while (this.hasNext() && this.is('\n'));
        }
      } catch (ex) {
        if (this.assembler.errors.length > 0) {
          this.restore(); // error occured => try to make state consistent again
        } else {
          throw ex;
        }
      }
    }
  };
})();