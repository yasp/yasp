(function () {
  if (yasp.Editor.initfile === undefined) {
    yasp.Editor.initfile = {};
  }

  var file;

  yasp.Editor.initfile.autosave = {
    init: function () {
      yasp.FileDialog.FileSystemDriver.LOCAL.openFile(yasp.files.autoSaveFile, function(_file) {
        file = _file;
      });
    },
    canLoad: function () {
      return yasp.Storage['automaticsave'] === "true" && (!!file);
    },
    load: function () {
      yasp.EditorManager.applyFile(file);
    }
  };
})();
