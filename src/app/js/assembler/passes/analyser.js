if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class Analyzes the source code and returns the map
   */
  yasp.Analyser = function () {

  };

  yasp.Analyser.prototype.pass = function (assembler, input) {
    var iterator = new yasp.TokenIterator(assembler, input);

    while (iterator.hasNext()) {
      // is command?
      try {
        var type;
        if (iterator.current().getType() == yasp.TokenType.LABEL) {
          // label \o/

        } else {
          while (iterator.hasNext() && !iterator.is('\n')) iterator.next();
        }

        if (iterator.hasNext()) {
          do {
            iterator.match('\n');
          } while (iterator.is('\n'));
        }
      } catch (ex) {
        iterator.restore(); // error occured => try to make state consistent again
      }
    }
  }
})();