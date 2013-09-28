if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Generates the machine code that can be executed by the emulator
   */
  yasp.Generator = function () {
    this.bitWriter = new yasp.BitWriter();
  };

  /**
   * Generates machine code out of the AST
   * @param assembler
   * @param input
   * @returns {number}
   */
  yasp.Generator.prototype.pass = function (assembler, input) {
    var results = [ ]; // attay containing all the ArrayBuffer of the nodes
    for (var i = 0; i < input.length; i++) {
      var node = input[i];
      if (!!node) {
        var result = node.type.generate.call(node, this);
        if (result.length > 0) results.push(result);
      }
    }
    
    // merge all results together
    var result = 42;
    
    return result;
  };

  /**
   * What types exist in an AST? The generate functions are all called in the context of the AstNode.
   * @type {{NODE_LABEL: {name: string, generate: Function}, NODE_COMMAND: {name: string, generate: Function}}}
   */
  yasp.AstNodeTypes = {
    NODE_LABEL: {
      name: "label",
      generate: function (generator) { }
    },
    NODE_COMMAND: {
      name: "command",
      generate: function (generator) {
        generator.bitWriter.append();
        for (var i = 0; i < this.params.params.length; i++) {
          var param = this.params.params[i];
          
          
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
    bits = bits.substr(bits.length - length, length);
    this.bits += bits; // append
  }

  /**
   * Returns the Uint8Array representation of the data
   * This function is quite costly so dont call it too often
   */
  yasp.BitWriter.prototype.toUint8Array = function() {
    var bits = this.bits;
    // normalize bits to 8
    var length = 8 - this.bits.length % 8;
    for (var i = 0; i < length; i++) {
      bits += "0";
    }
    // now create array
    var array = new Uint8Array(bits.length / 8);
    
    // put data into the array
    for (var i = 0; i < array.length; i++) {
      var block = bits.substr(i, 8);
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