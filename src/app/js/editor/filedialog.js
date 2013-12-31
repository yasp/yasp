if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.FileDialogMode = {
    OPEN: 1,
    SAVE: 2,
    SAVEAS: 3
  };
  
  
  var dialogMode;
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