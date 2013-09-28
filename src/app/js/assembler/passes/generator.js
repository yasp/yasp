if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Generates the machine code
   */
  yasp.Generator = function () {

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
        var result = node.type.generate.call(node);
        if (result.length > 0) results.push(result);
      }
    }
    
    // merge all results together
    var result = 42;
    
    return result;
  }

  /**
   * What types exist in an AST? The generate functions are all called in the context of the AstNode.
   * @type {{NODE_LABEL: {name: string, generate: Function}, NODE_COMMAND: {name: string, generate: Function}}}
   */
  yasp.AstNodeTypes = {
    NODE_LABEL: {
      name: "label",
      generate: function () {
      }
    },
    NODE_COMMAND: {
      name: "command",
      generate: function () {
        // create bitcode
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
  yasp.AstNode = function (type, token, params) {
    this.type = type;
    this.params = params;
    this.token = token;
  }
})();