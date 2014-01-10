if (typeof yasp == 'undefined') yasp = { };

(function() {
  var updateInterval;
  
  $('body').ready(function() {
    yasp.Debugger.editor = yasp.EditorManager.create($('#debugger_editor').get(0));
    yasp.Debugger.editor.swapDoc(yasp.EditorManager.editors[0].linkedDoc({
      sharedHist: true
    }));
    yasp.Debugger.editor.setOption('readOnly', "nocursor");
  });
  
  
  yasp.Debugger = {
    show: function(mode) {
      if (!!yasp.Debugger.EmulatorCommunicator) yasp.EmulatorCommunicator.terminate();
      yasp.Debugger.EmulatorCommunicator = new yasp.Communicator("app/js/emulator/emulator_backend.js");
      yasp.Debugger.mode = mode;
      
      $('#dialog_debugger').modal({
        'keyboard': true
      }).on('shown.bs.modal', function() {
        yasp.Debugger.breadboard = new yasp.BreadBoard($('#hardwarecontainer'), yasp.Debugger.EmulatorCommunicator, yasp.BreadBoardTypes.usbmaster);
        yasp.Debugger.breadboard.build();
        yasp.Debugger.breadboard.render();
        
        // load code into emulator
        yasp.Debugger.EmulatorCommunicator.sendMessage("LOAD", {
          bitcode: yasp.Editor.bitcode,
          start: 0
        }, function() {
          if(yasp.Debugger.mode === "run") {
            yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
              count: null
            });
          }
        });
        
      }).on('hidden.bs.modal', function() {
        // stop execution
        if (yasp.Debugger.EmulatorCommunicator) {
          yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
          yasp.Debugger.EmulatorCommunicator.terminate();
          yasp.Debugger.EmulatorCommunicator = null;
        }

        if(yasp.Debugger.breadboard) {
          yasp.Debugger.breadboard.destroy();
        }
          
        if (!!updateInterval) {
          clearInterval(updateInterval);
          updateInterval = null;
        }
      });

      var updateFunc;
      updateInterval || (updateInterval = setInterval(updateFunc = function() {
        var height = $('#dialog_debugger .modal-content').height();
        $('#debugger_table').css({
          "height": (height-200)+"px"
        });

        yasp.Debugger.editor.refresh();
      }, 250)); // weird hack for CodeMirror & size adjustment
      
      setTimeout(updateFunc, 10);
    }
  };
})();

