if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Generates the machine code that can be executed by the emulator
   */
  yasp.Generator = function () {
    this.bitWriter = null;
    this.assembler = null;
  };

  /**
   * Generates machine code out of the AST
   * @param assembler
   * @param input
   * @returns {number}
   */
  yasp.Generator.prototype.pass = function (assembler, input) {
    this.assembler = assembler;
    
    if (assembler.jobs.indexOf("bitcode") != -1 || assembler.jobs.indexOf("map") != -1) {
      var labelMachinePosition = { };
  
      // 1 pass: get position in machine code for every Ast Node (for labels)
      var pos = 0;
      for (var i = 0; i < input.length; i++) {
        var node = input[i];
        if (!!node) {
          this.bitWriter = new yasp.BitWriter();
          node.machinePosition = pos;
          pos += node.type.calculateBitSize.call(node, this);
        }
      }
    }
    
    if (assembler.jobs.indexOf("map") != -1) {
      // generate map
      if (assembler.jobs.indexOf('map') != -1) {
        var map = { };
        for (var i = 0; i < input.length; i++) {
          var node = input[i];
          if (node.type == yasp.AstNodeTypes.NODE_COMMAND) {
            // put into map if its a command
            if (!!map[node.token.line]) {
              throw "Duplicate entry in map";
            } else {
              map[node.token.line] = node.machinePosition;
            }
          }
        }
        assembler.map = map;
      }
    }
    
    if (assembler.jobs.indexOf("bitcode") == -1) {
      return null;
    } else {
      // generate map
      if (assembler.jobs.indexOf('map') != -1) {
        var map = { };
        for (var i = 0; i < this.nodes.length; i++) {
          var node = this.nodes[i];
          if (node.type == yasp.AstNodeTypes.NODE_COMMAND) {
            // put into map if its a command

          }
        }
      }
  
      this.bitWriter = new yasp.BitWriter();
      // 2 pass: real generation
      for (var i = 0; i < input.length; i++) {
        var node = input[i];
        if (!!node) {
          node.type.generate.call(node, this);
        }
      }
      return this.bitWriter.toUint8Array();
    }
  };
  
  /**
   * What types exist in an AST? The generate functions are all called in the context of the AstNode.
   * @type {{NODE_LABEL: {name: string, generate: Function}, NODE_COMMAND: {name: string, generate: Function}}}
   */
  yasp.AstNodeTypes = {
    NODE_LABEL: {
      name: "label",
      generate: function(generator) {
        // update machine position
        labelMachinePosition[this.params.label.text.toUpperCase()] = this.machinePosition;
      },
      calculateBitSize: function() {
        return 0;
      }
    },
    NODE_COMMAND: {
      name: "command",
      generate: function(generator) {
        var writer = generator.bitWriter;
        var commandCode = this.params.command.code;
        var commandParam = this.params.command.params;
        var params = this.params.params;
        
        for (var i = 0; i < commandCode.length; i++) {
          var code = commandCode[i];
          var data;
          if (typeof code.value == "string") {
            data = +parseInt(code.value, 2);
          } else {
            data = +code.value;
          }
          var len;
          if (typeof code.length == 'undefined') {
            len = 8;
          } else {
            len = code.length;
          }
          
          writer.append(data, len);
        }
        
        // params
        for (var i = 0; i < params.length; i++) {
          var param = params[i].text;
          var type = yasp.ParamType[commandParam[i].type.toLowerCase()];
          
          writer.append(type.data(param), type.len);
        }
      },
      calculateBitSize: function() {
        var size = 0;
        var commandCode = this.params.command.code;
        var commandParam = this.params.command.params;
        var params = this.params.params;

        for (var i = 0; i < commandCode.length; i++) {
          var code = commandCode[i];
          var len;
          if (typeof code.length == 'undefined') {
            len = 8;
          } else {
            len = code.length;
          }
          size += len;
        }

        // params
        for (var i = 0; i < params.length; i++) {
          var type = yasp.ParamType[commandParam[i].type.toLowerCase()];
          size += type.len;
        }
        return size;
      }
    }
  };
  
  yasp.ParamType = {
    "r_byte": {
      len: 5,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.BYTE_REGISTER;
      },
      data: function(data) {
        return +(data.substr(1)); // skip b from b2 for example
      }
    },
    "r_word": {
      len: 5,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.WORD_REGISTER;
      },
      data: function(data) {
        return +(data.substr(1)); // skip w from w2 for example
      }
    },
    "l_byte": {
      len: 8,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.NUMBER && +cur.text < Math.pow(2, 8);
      },
      data: function(data) {
        return data;
      }
    },
    "l_word": {
      len: 16,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.NUMBER && +cur.text < Math.pow(2, 16);
      },
      data: function(data) {
        return data;
      }
    },
    "pin": {
      len: 5,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.NUMBER && +cur.text < Math.pow(2, 5);
      },
      data: function(data) {
        return data;
      }
    },
    "address": {
      len: 11,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.LABEL && assembler.getLabel(cur.text);
      },
      data: function(data) {
        return labelMachinePosition[data];
      }
    }
  };

  /**
   * An AST Node
   * @param type
   * @param token
   * @param params
   * @constructor
   */
  yasp.AstNode = function(type, token, params) {
    this.type = type;
    this.params = params;
    this.token = token;
    this.machinePosition = 0;
  };

  /**
   * A writer class that makes writing bit data easy
   * @constructor
   */
  yasp.BitWriter = function() {
    this.bits = "";
  }

  /**
   * Appends data to the array
   * @param data Which data (is converted to a number)
   * @param length How many bits?
   */
  yasp.BitWriter.prototype.append = function(data, length) {
    var bits = (+data).toString(2); // convert to binary
    
    if (bits.length < length) { // if its too short => add
      var origLen = bits.length;
      for (var i = origLen; i < length; i++) {
        bits = "0" + bits;
      }
    } else if (bits.length > length) {
      bits = bits.substr(bits.length - length, length); // if its too long => cut
    }
    this.bits += bits; // append
  }

  /**
   * Returns the Uint8Array representation of the data
   * This function is quite costly so dont call it too often
   */
  yasp.BitWriter.prototype.toUint8Array = function() {
    var bits = this.bits;
    // normalize bits to 8
    var overflow = this.bits.length % 8;
    if (overflow != 0) {
      for (var i = 0; i < 8 - overflow; i++) {
        bits += "0";
      }
    }
    // now create array
    var array = new Uint8Array(bits.length / 8);
    
    // put data into the array
    for (var i = 0; i < array.length; i++) {
      var block = bits.substr(i*8, 8);
      var num = parseInt(block, 2);
      if (isNaN(num)) {
        throw "Block contained not a number "+i;
      } else {
        array[i] = num;
      }
    }
    
    // finish \o/
    return array;
  }
})();