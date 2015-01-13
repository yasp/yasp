(function () {
  if (yasp.Editor.initfile === undefined) {
    yasp.Editor.initfile = {};
  }

  yasp.Editor.initfile.defaultcode = {
    init: function () {
    },
    canLoad: function () {
      return yasp.config.loadinitialcode;
    },
    load: function () {
      $.ajax('app/initialcode.txt').done(function(responseText) {
        yasp.EditorManager.applyFile({ content: responseText });
      }).fail(function() {
        console.log("failed to load initial code");
      });
    }
  };
})();
