if (typeof yasp == 'undefined') yasp = { };

(function() {
  var updateInterval;
  var debuggerEditor;
  
  $('body').ready(function() {
    debuggerEditor = yasp.EditorManager.create($('#debugger_editor').get(0));
    debuggerEditor.swapDoc(yasp.EditorManager.editors[0].linkedDoc({
      sharedHist: true
    }));
    debuggerEditor.setOption('readOnly', "nocursor");
  });
  
  
  yasp.Debugger = {
    show: function() {
      if (!!yasp.EmulatorCommunicator) yasp.EmulatorCommunicator.terminate();
      
      yasp.EmulatorCommunicator = new yasp.Communicator("app/js/emulator/emulator_backend.js");
      
      $('#dialog_debugger').modal({
        'keyboard': true
      }).on('shown.bs.modal', function() {
        var breadboard = new yasp.BreadBoard($('#hardwarecontainer'), yasp.EmulatorCommunicator, yasp.BreadBoardTypes.usbmaster);
        breadboard.build();
        breadboard.render();
        
        // load code into emulator
        yasp.EmulatorCommunicator.sendMessage("LOAD", {
          bitcode: yasp.Editor.bitcode,
          start: 0
        }, function() {
          yasp.EmulatorCommunicator.sendMessage("CONTINUE", {
            count: null
          });
        });
        
      }).on('hidden.bs.modal', function() {
        // stop execution
        yasp.EmulatorCommunicator.sendMessage("BREAK", { });
        yasp.EmulatorCommunicator.terminate();
        yasp.EmulatorCommunicator = null;
      });
      
      var updateFunc;
      updateInterval || (updateInterval = setInterval(updateFunc = function() {
        var height = $('#dialog_debugger .modal-content').height();
        $('#debugger_table').css({
          "height": (height-200)+"px"
        });

        debuggerEditor.refresh();
      }, 250)); // weird hack for CodeMirror & size adjustment
      
      setTimeout(updateFunc, 10);
    }
  };
})();

