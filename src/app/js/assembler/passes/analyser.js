if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Analyzes the source code and returns all the labels defined in the source code
   */
  yasp.Analyser = function () {

  };

  /**
   * Analyzes the source code and searches for labels
   * @param assembler
   * @param input
   * @returns {*}
   */
  yasp.Analyser.prototype.pass = function (assembler, input) {
    var iterator = new yasp.TokenIterator(assembler, input);
    var labels = { };
    iterator.iterate((function() {
      var type;
      if (iterator.current().getType() == yasp.TokenType.LABEL) {
        // label \o/
        var label = iterator.current();
        iterator.next();
        if (iterator.is(":")) {
          if (!!labels[label.text.toUpperCase()]) {
            iterator.riseSyntaxError("Duplicate label "+label.text);
          } else {
            labels[label.text.toUpperCase()] = label;
          }
        }
      }
      while (iterator.hasNext() && !iterator.is('\n')) iterator.next(); // go to \n
    }).bind(this));

    assembler.symbols.labels = labels;

    return input;
  };
})();