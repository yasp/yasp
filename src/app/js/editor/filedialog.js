if (typeof yasp == 'undefined') yasp = { };
if (typeof yasp.Storage == 'undefined') yasp.Storage = localStorage || { };

(function() {
  yasp.ServerURL = "http://localhost:8000/file.php";
  
  yasp.FileDialogMode = {
    OPEN: 1,
    SAVE: 2,
    SAVEAS: 3,
    NEW: 4
  };

  if (typeof yasp.Storage.files == 'undefined') yasp.Storage.files = { };
  
  var fileSystemDriver = {
    LOCAL: {
      newFile: function(name, cb) {
        var file, err;
        if (!!yasp.Storage.files[name]) {
          // file exists
          file = null;
        } else {
          // create file
          file = (yasp.Storage.files[name] = {
            filename: name,
            username: "local",
            createdate: new Date().getTime(),
            group: "local",
            changedate: new Date().getTime(),
            content: ""
          });
        }
        setTimeout(function() {
          cb(file, 0);
        });
      },
      requestList: function(cb) {
        setTimeout(function() {
          cb(yasp.Storage.files);
        }, 0);
      }
    },
    SERVER: {
      
    }
  };
  var fileSystem = fileSystemDriver.LOCAL;
  var dialogMode;
  var dialogFiles;
  yasp.FileDialog = {
    show: function(mode) {
      dialogMode = mode;
      $('#dialog_file').modal({
        'keyboard': true
      });
      $('#dialog_file .open, #dialog_file .save, #dialog_file .saveas, #dialog_file .new').hide();

      $('#dialog_file a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var tab = $(e.target);
        if (tab.hasClass('link_server')) fileSystem = fileSystemDriver.SERVER;
        if (tab.hasClass('link_local')) fileSystem = fileSystemDriver.LOCAL;
        
        fileSystem.requestList(function(files) {
          
        });
      });
      
      var visible;
      switch (mode) {
        case yasp.FileDialogMode.OPEN:
          visible = "open";
          break;
        case yasp.FileDialogMode.SAVE:
          visible = "save";
          break;
        case yasp.FileDialogMode.SAVEAS:
          visible = "saveas";
          break;
        case yasp.FileDialogMode.NEW:
          visible = "new";
          break;
      }
      $('#dialog_file .'+visible).show();
      
      $('#filedialog_open').click(function() {
        
      });
      $('#filedialog_save').click(function() {

      });
      $('#filedialog_saveas').click(function() {

      });
      $('#filedialog_new').click(function() {
        fileSystem.newFile($('#filedialog_name').text(), function(file) {
          if (!!file) {
            // success
            yasp.EditorManager.applyFile(file);
          } else {
            // error
            // TODO: implement visible error message
          }
        });
      });
    },
    close: function() {
      
    }
  };
})();