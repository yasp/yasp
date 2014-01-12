if (typeof yasp == 'undefined') yasp = { };

(function() {
  $('body').ready(function() {
    yasp.Debugger.editor = yasp.EditorManager.create($('#debugger_editor').get(0));
    yasp.Debugger.editor.swapDoc(yasp.EditorManager.editors[0].linkedDoc({
      sharedHist: true
    }));
    yasp.Debugger.editor.setOption('readOnly', "nocursor");
    yasp.Debugger.debugLog = $('#debugger-tabs-debug > pre:first');
  });

  yasp.Debugger = {
    show: function(mode) {
      if (!!yasp.Debugger.EmulatorCommunicator) yasp.EmulatorCommunicator.terminate();
      yasp.Debugger.EmulatorCommunicator = new yasp.Communicator("app/js/emulator/emulator_backend.js");
      yasp.Debugger.mode = mode;
      yasp.Debugger.isEmulatorRunning = false;
      yasp.Debugger.lastExecutedLine = 0;

      clearDebugLog();
      
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
          yasp.Debugger.EmulatorCommunicator.subscribe("DEBUG", onEmulatorDebug);

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

      function onEmulatorBreak (data) {
        var reason = data.payload.reason;
        yasp.Debugger.isEmulatorRunning = false;
        refreshDebugger();
      }

      function onEmulatorDebug (data) {
        var msg = data.payload;

        if(msg.type === "register") {
          var val = "";
          if(msg.subtype === "b")
            val = formatHexNumber(msg.val, 2);
          else if(msg.subtype === "w")
            val = formatHexNumber(msg.val, 4);
          addDebugLog(msg.subtype + msg.addr + ": 0x" + val + "\n");
        } else if(msg.type === "string") {
          addDebugLog(msg.val + "\n");
        }
      }

      // http://stackoverflow.com/a/57807/2486196
      function formatHexNumber(d, padding) {
        var hex = Number(d).toString(16);
        while (hex.length < padding)
          hex = "0" + hex;
        return hex;
      }

      function addDebugLog(str) {
        yasp.Debugger.debugLog.text(yasp.Debugger.debugLog.text() + str);
        yasp.Debugger.debugLog.scrollTop(yasp.Debugger.debugLog[0].scrollHeight);
      }

      function clearDebugLog() {
        yasp.Debugger.debugLog.text("");
      }

      function refreshDebugger() {
        yasp.Debugger.EmulatorCommunicator.sendMessage("GET_STATE", {},
          function (data) {
            var state = data.payload;

            renderBytes(state.ram, 0x10, $('#debugger-ramdump'));
            if(yasp.Debugger.lastRam)
              colorChangedBytes(getChangedBytes(state.ram, yasp.Debugger.lastRam), $('#debugger-ramdump'));
            yasp.Debugger.lastRam = state.ram;

            renderBytes(state.rom, 0x10, $('#debugger-romdump'));
            if(yasp.Debugger.lastRom)
              colorChangedBytes(getChangedBytes(state.rom, yasp.Debugger.lastRom), $('#debugger-romdump'));
            yasp.Debugger.lastRom = state.rom;

            var line = yasp.Editor.reverseMap[state.registers.special.pc] - 1;
            yasp.Debugger.editor.removeLineClass(yasp.Debugger.lastExecutedLine, 'background', 'line-active');
            yasp.Debugger.editor.addLineClass(line, 'background', 'line-active');

            yasp.Debugger.lastExecutedLine = line;
          }
        );
      }

      function renderBytes (bytes, width, $container) {
        var $bytes = null;
        var inRow = 0;

        $container.empty();

        for(var i = 0; i < bytes.length; i++) {
          if(inRow === width || $bytes === null) {
            var $row = $('<div class="byterow">');
            $row.append($('<div class="offset">').text("0x" + formatHexNumber(i, 4)));
            $bytes = $('<div class="bytes">');
            $row.append($bytes);
            $container.append($row);

            inRow = 0;
          }

          var byte = formatHexNumber(bytes[i], 2);
          var $byte = $('<div class="byte">');
          $byte.text(byte);
          $byte.attr("data-offset", i);
          $bytes.append($byte);

          inRow++;
        }
      }

      function getChangedBytes (dump1, dump2) {
        var changed = [];
        for (var i = 0; i < dump1.length; i++) {
          if(dump1[i] !== dump2[i])
            changed.push(i);
        }
        return changed;
      }

      function colorChangedBytes (changed, $container) {
        for (var i = 0; i < changed.length; i++) {
          $container.find('.byte[data-offset="' + changed[i] + '"]').css('color', 'red');
        }
      }
    }
  };
})();

