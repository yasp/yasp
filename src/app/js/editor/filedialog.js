if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.ServerURL = "http://localhost:8000/file.php";
  
  yasp.FileDialogMode = {
    OPEN: 1,
    SAVE: 2,
    SAVEAS: 3
  };
  
  
  var dialogMode;
  var dialogFiles;
  yasp.FileDialog = {
    show: function(mode) {
      dialogMode = mode;
      $('#dialog_file').modal({
        'keyboard': true
      });
      
      
    },
    close: function() {
      
    }
  };
})();