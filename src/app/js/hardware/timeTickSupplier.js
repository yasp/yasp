if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.timeTickSupplier = {
    tick: function () {
      return window.performance.now()
    }
  };
})();