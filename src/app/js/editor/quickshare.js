(function () {
  if(yasp.Editor.initfile === undefined) { yasp.Editor.initfile = {}; }

  yasp.Editor.initfile.quickshare = {
    init: function () {
      if(yasp.config.quickshare.enabled === false) {
        $('.menu_share, .menu_shareseperator').css('display', 'none');
      }

      $('.menu_share').click(function () {
        $.ajax({
          type: "POST",
          url: yasp.config.quickshare.firebaseurl + "/codes.json",
          data: JSON.stringify({ code: editor.getValue() }),
          success: function (data) {
            var name = data.name;
            var url = document.location.href.split('#')[0];
            if(url.charAt(url.length - 1) !== "/")
              url += "/";
            url += "#q=" + name;

            prompt(yasp.l10n.getTranslation("editor.toolbar.quickshare.msg"), url);
            location.replace(url);
            location.reload();
          }
        });
      });
    },
    canLoad: function () {
      return (yasp.config.quickshare.enabled === true) && (window.location.hash.indexOf('#q=') === 0);
    },
    load: function () {
      var hash = window.location.hash.substr(3);
      $.ajax({
        type: "GET",
        url: yasp.config.quickshare.firebaseurl + "/codes/" + hash + ".json",
        success: function (data) {
          var content = (data || { }).code;
          if (content || content === "") {
            yasp.FileDialog.FileSystemDriver.LOCAL.newFile(yasp.files.quickShareFile, function(file) {
              var save = function() {
                file.content = content;
                yasp.FileDialog.FileSystemDriver.LOCAL.saveFile(file, function() {
                  yasp.EditorManager.applyFile(file); // gotta love callbacks
                });
              };
              if (!file) {
                yasp.FileDialog.FileSystemDriver.LOCAL.openFile(yasp.files.quickShareFile, function(realfile) {
                  file = realfile;
                  save();
                })
              } else {
                save();
              }
            });
          }
        }
      });
    }
  };
})();