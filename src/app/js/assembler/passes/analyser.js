if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Analyzes the source code and returns all the labels defined in the source code
   */
  yasp.Analyser = function () {

  };

  yasp.Analyser.prototype.pass = function (assembler, input) {
    var iterator = new yasp.TokenIterator(assembler, input);
    var labels = [ ];
    iterator.iterate((function() {
      var type;
      if (iterator.current().getType() == yasp.TokenType.LABEL) {
        // label \o/
        var label = iterator.current();
        iterator.next();
        if (iterator.is(":")) {
          labels.push(label);
        }
      }
      while (iterator.hasNext() && !iterator.is('\n')) iterator.next(); // go to \n
    }).bind(this));

    assembler.symbols.labels = labels;

    return input;
  }
})();