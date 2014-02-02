if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Generates the machine code that can be executed by the emulator
   */
  yasp.Generator = function () {
    this.bitWriter = null;
    this.assembler = null;
    this.labelMachinePosition = { };
    this.linkPos = 0; // position during linking
  };

  /**
   * Generates machine code out of the AST
   * @param assembler
   * @param input
   * @returns {number}
   */
  yasp.Generator.prototype.pass = function (assembler, input) {
    this.assembler = assembler;
    this.labelMachinePosition = { };
    
    if (assembler.jobs.indexOf("bitcode") != -1 || assembler.jobs.indexOf("map") != -1) {
      // 1 pass: get position in machine code for every Ast Node (for labels)
      this.linkPos = 0;
      for (var i = 0; i < input.length; i++) {
        var node = input[i];
        if (!!node) {
          node.machinePosition = ~~(this.linkPos / 8);
          if (node.type == yasp.AstNodeTypes.NODE_LABEL) {
            node.type.generate.call(node, this)
          }
          var increment = node.type.calculateBitSize.call(node, this);
          this.linkPos += increment;
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
    
    if (assembler.jobs.indexOf("bitcode") != -1) {
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
    
    return null;
  };
  
  /**
   * What types exist in an AST? The generate functions are all called in the context of the AstNode.
   * @type {{NODE_LABEL: {name: string, generate: Function}, NODE_COMMAND: {name: string, generate: Function}}}
   */
  yasp.AstNodeTypes = {
    NODE_DUMP: {
      name: "dump",
      generate: function(generator) {
        if (this.params.data instanceof String) {
          if (!!this.params.len) {
            // label address
            var labelToken = generator.assembler.getLabel(this.params.data);
            
            generator.bitWriter.append(generator.labelMachinePosition[labelToken.text.toUpperCase()], this.params.len);
          } else {
            var str = this.params.data.substring(1, this.params.data.length-1); // remove '"'
            for (var i = 0; i < str.length; i++) {
              generator.bitWriter.append(str.charCodeAt(i), 8);
            }
            generator.bitWriter.append('\0', 8);
          }
        } else {
          generator.bitWriter.append(this.params.data, this.params.len);
        }
      },
      calculateBitSize: function() {
        if (this.params.data instanceof String && !this.params.len) {
          return this.params.data.length*8 + 8; // data + \0
        } else {
          return this.params.len;
        }
      }
    },
    NODE_ORG: {
      name: "org",
      generate: function(generator) {
        generator.bitWriter.jumpTo(this.params.len*8);
      },
      calculateBitSize: function(generator) {
        generator.linkPos = 0;
        return this.params.len*8;
      }
    },
    NODE_LABEL: {
      name: "label",
      generate: function(generator) {
        // update machine position
        generator.labelMachinePosition[this.params.label.text.toUpperCase()] = this.machinePosition;
      },
      calculateBitSize: function() {
        return 0;
      }
    },
    NODE_UNKNOWNCOMMAND: {
      name: "unknowncommand",
      generate: function(generator) {
        throw "Cannot generate bitcode for unknown command";
      },
      calculateBitSize: function() {
        return 42;
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
          var data, len;
          
          if (typeof code.value == "string") {
            data = +parseInt(code.value, 2);
            len = code.value.length;
          } else {
            data = +code.value;
            len = 8;
          }
          
          writer.append(data, len);
        }
        
        // params
        for (var i = 0; i < params.length; i++) {
          var param = params[i].text;
          var type = yasp.ParamType[commandParam[i].type.toLowerCase()];
          
          writer.append(type.data(param, generator), type.len);
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
          if (typeof code.value == "string") {
            len = code.value.length;
          } else {
            len = 8;
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
      data: function(data, generator) {
        return +(data.substr(1)); // skip b from b2 for example
      }
    },
    "r_word": {
      len: 5,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.WORD_REGISTER;
      },
      data: function(data, generator) {
        return +(data.substr(1)); // skip w from w2 for example
      }
    },
    "l_byte": {
      len: 8,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.NUMBER && +cur.text < Math.pow(2, 8);
      },
      data: function(data, generator) {
        return data;
      }
    },
    "l_word": {
      len: 16,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.NUMBER && +cur.text < Math.pow(2, 16);
      },
      data: function(data, generator) {
        return data;
      }
    },
    "pin": {
      len: 5,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.NUMBER && +cur.text < Math.pow(2, 5);
      },
      data: function(data, generator) {
        return data;
      }
    },
    "address": {
      len: 11,
      check: function(cur, assembler) {
        return cur.getType() == yasp.TokenType.LABEL && assembler.getLabel(cur.text);
      },
      data: function(data, generator) {
        var result = generator.labelMachinePosition[data.toUpperCase()];
        if (!isNaN(result) ) {
          return result;
        } else {
          throw "Unknown label in generator";
        }
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
    this.pointer = 0;
  };

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
    
    // check if really appending
    if (this.bits.length == this.pointer) {
      this.bits += bits; // append
    } else {
      this.bits = this.bits.substr(0, this.pointer) + bits + ((this.bits.length > (this.pointer + bits.length)) ? this.bits.substr(this.pointer + bits.length) : ""); // replace
    }
    
    this.pointer += bits.length;
  };

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
  };
  
  /**
   * Jumps to a specific positon in the bitcode
   * If the position does not exist yet, it is created
   * @param pos Position where it jumps to
   */
  yasp.BitWriter.prototype.jumpTo = function(pos) {
    // does this position already exists?
    if (pos >= this.bits.length) {
      var l = this.bits.length;
      for (var i = 1; i <= (pos - l); i++) {
        this.bits += "0";
      }
    }
    this.pointer = pos;
  };
})();