if (typeof yasp == 'undefined') yasp = { };

(function() {
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
      yasp.Debugger.isEmulatorRunning = false;
      yasp.Debugger.lastExecutedLine = 0;
      
      $('#dialog_debugger').modal({
        'keyboard': true
      }).on('shown.bs.modal', function() {
        yasp.Debugger.breadboard = new yasp.BreadBoard($('#hardwarecontainer'), yasp.Debugger.EmulatorCommunicator, yasp.BreadBoardTypes.usbmaster);
        yasp.Debugger.breadboard.build();
        yasp.Debugger.breadboard.render();

        yasp.Debugger.editor.refresh();
        
        // load code into emulator
        yasp.Debugger.EmulatorCommunicator.sendMessage("LOAD", {
          bitcode: yasp.Editor.bitcode,
          start: 0
        }, function() {
          yasp.Debugger.EmulatorCommunicator.subscribe("CONTINUE", onEmulatorContinue);
          yasp.Debugger.EmulatorCommunicator.subscribe("BREAK", onEmulatorBreak);

          if(yasp.Debugger.mode === "run") {
            yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
              count: null
            });
          } else {
            refreshDebugger();
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
      });

      $('.debugger_step').click(function () {
        if(!yasp.Debugger.isEmulatorRunning) {
          yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
            count: 1
          });
        } else {
          alert("no")
        }
      });

      $('.debugger_break').click(function () {
        yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
      });

      $('.debugger_continue').click(function () {
        yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
          count: null
        });
      });

      function onEmulatorContinue () {
        yasp.Debugger.isEmulatorRunning = true;
      }

      function onEmulatorBreak (reason) {
        yasp.Debugger.isEmulatorRunning = false;
        refreshDebugger();
      }

      function refreshDebugger() {
        yasp.Debugger.EmulatorCommunicator.sendMessage("GET_STATE", {},
          function (data) {
            var state = data.payload;

            var line = yasp.Editor.reverseMap[state.registers.special.pc] - 1;
            yasp.Debugger.editor.removeLineClass(yasp.Debugger.lastExecutedLine, 'background', 'line-active');
            yasp.Debugger.editor.addLineClass(line, 'background', 'line-active');

            yasp.Debugger.lastExecutedLine = line;
          }
        );
      }
    }
  };
})();

