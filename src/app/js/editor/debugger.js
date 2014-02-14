if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.Debugger = {
    show: function(mode) {
      yasp.Debugger.mode = mode;
      $('#dialog_debugger').modal('show');
    },
    formatPadding : {
      bin: 8,
      dec: 3,
      hex: 2
    },
    parts: [ "breakpoints", "ramrom", "debugLog", "registers", "status" ],
    states: []
  };

  function firePartEvent (name, params) {
    for (var i = 0; i < yasp.Debugger.parts.length; i++) {
      var part = yasp.Debugger[yasp.Debugger.parts[i]];
      if (typeof part[name] === "function") {
        part[name].apply(null, params || []);
      }
    }
  }

  $('body').ready(function() {
    yasp.Debugger.editor = yasp.EditorManager.create($('#debugger_editor').get(0));
    yasp.Debugger.editor.swapDoc(yasp.EditorManager.editors[0].linkedDoc({
      sharedHist: true
    }));

    yasp.Debugger.editor.setOption('readOnly', "nocursor");

    firePartEvent("onInit");

    $('#dialog_debugger').modal({
      'show': false,
      'keyboard': true
    }).on('shown.bs.modal', function() {
      if (!!yasp.Debugger.EmulatorCommunicator) yasp.EmulatorCommunicator.terminate();
      yasp.Debugger.EmulatorCommunicator = new yasp.Communicator("app/js/emulator/emulator_backend.js");

      yasp.Debugger.breadboard = new yasp.BreadBoard($('#hardwarecontainer'), yasp.Debugger.EmulatorCommunicator, yasp.BreadBoardTypes.usbmaster);
      yasp.Debugger.breadboard.build();
      $(window).resize(); // force firefox to update the width of breadboard

      yasp.Debugger.editor.refresh();

      yasp.Debugger.states = [];

      // load code into emulator
      yasp.Debugger.EmulatorCommunicator.sendMessage("LOAD", {
        bitcode: yasp.Editor.bitcode,
        start: 0
      }, function() {
        yasp.Debugger.EmulatorCommunicator.subscribe("BREAK", onEmulatorBreak);
        yasp.Debugger.EmulatorCommunicator.subscribe("CONTINUE", onEmulatorContinue);
        yasp.Debugger.EmulatorCommunicator.subscribe("DEBUG", onEmulatorDebug);

        firePartEvent("onOpen");
        yasp.Debugger.breadboard.render();

        if(yasp.Debugger.mode === "run") {
          yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
            count: null
          });
        } else {
          yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
        }
      });
    }).on('hidden.bs.modal', function() {
      // stop execution
      if (yasp.Debugger.EmulatorCommunicator) {
        yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
        yasp.Debugger.EmulatorCommunicator.terminate();
        yasp.Debugger.EmulatorCommunicator = null;
      }

      highlightLine(null, true);

      if(yasp.Debugger.breadboard) {
        yasp.Debugger.breadboard.destroy();
      }
    });

    $('.debugger_step').click(function () {
      yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
        count: 1,
        skipBreakpoint: true
      });
    });

    $('.debugger_stepBack').click(function () {
      if(yasp.Debugger.states.length > 1) {
        yasp.Debugger.states.pop();
      }

      var state = yasp.Debugger.states.pop();

      yasp.Debugger.steppedBack = true;
      yasp.Debugger.EmulatorCommunicator.sendMessage("SET_STATE", state);
      yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
    });

    $('.debugger_break').click(function () {
      yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
    });

    $('.debugger_continue').click(function () {
      yasp.Debugger.states = [];
      highlightLine(null,  true);
      yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
        count: null,
        skipBreakpoint: yasp.Debugger.breakpointHit
      });
    });
    
    $('.debugger_jumpto').click(function() {
      // change cursor
      $('#debugger_editor_wrapper .CodeMirror-lines').css({
        'cursor': 'crosshair'
      });
      
      // set listener
      var func;
      yasp.Debugger.editor.on('mousedown', func = function() {
        setTimeout(function() { // CodeMirror needs time to update cursor properly
          var cursor = yasp.Debugger.editor.getCursor();
          var line = cursor.line + 1;
          var commandPosition;
          do {
            commandPosition = yasp.Editor.map[line];
            line++;
          } while(typeof commandPosition == 'undefined' && line < yasp.Debugger.editor.lineCount());
          
          console.log("Jump To "+cursor.line+" OpCode "+commandPosition);
  
          yasp.Debugger.EmulatorCommunicator.sendMessage("BREAK", { });
          
          yasp.Debugger.EmulatorCommunicator.sendMessage("SET_STATE", {
            registers: {
              special: {
                pc: commandPosition
              }
            }
          }, getState);
          
          // disable listener
          $('#debugger_editor_wrapper .CodeMirror-lines').css({
            'cursor': 'text'
          });
  
          yasp.Debugger.editor.off('mousedown', func);
        }, 100);
      });
    });
  });

  function onEmulatorBreak (data) {
    var reason = data.payload.reason;
    var state = data.payload.state;
    firePartEvent("onBreak", [reason]);
    refreshDebugger(state);
    $('.debuggerTabOverlay').addClass('break');
  }

  function onEmulatorContinue () {
    firePartEvent("onContinue");
    $('.debuggerTabOverlay').removeClass('break');
  }

  function onEmulatorDebug (data) {
    firePartEvent("onDebug", [data.payload]);
  }

  function getState () {
    yasp.Debugger.EmulatorCommunicator.sendMessage("GET_STATE", {},
      function (data) { refreshDebugger(data.payload); }
    );
  }

  function refreshDebugger(state) {
    yasp.Debugger.states.push(state);

    firePartEvent("onState", [state]);

    var line = yasp.Editor.reverseMap[state.registers.special.pc] - 1;
    highlightLine(line, true);
  }

  function highlightLine (line, clearOthers) {

    if(clearOthers) {
      var count = yasp.Debugger.editor.lineCount();

      for (var i = 0; i < count; i++) {
        yasp.Debugger.editor.removeLineClass(i, 'background', 'line-active');
      }
    }
    if(line !== null && !isNaN(line)) {
      yasp.Debugger.editor.addLineClass(line, 'background', 'line-active');
      yasp.Debugger.scrollLineIntoView(line);
    }
  }

  yasp.Debugger.scrollLineIntoView = function (line) {
    yasp.Debugger.editor.scrollIntoView({ line: line, ch: 0}, 20);
  };

  yasp.Debugger.cycleNumberFormat = function ($span, current) {
    var newVal;

    switch(current) {
      case "hex": newVal = "bin"; break;
      case "bin": newVal = "dec"; break;
      case "dec": newVal = "hex"; break;
    }

    $span.text(newVal.toUpperCase());
    return newVal;
  };

  yasp.Debugger.formatNameToRadix = function (name) {
    name = name.toUpperCase();
    if(name === "OCT")
      return 8;
    if(name === "BIN")
      return 2;
    if(name === "DEC")
      return 10;
    if(name === "HEX")
      return 16;
    return 10;
  };

  yasp.Debugger.formatHexNumber = function (d, padding) {
    return yasp.Debugger.formatNumber(d, padding, 16);
  };

  // http://stackoverflow.com/a/57807/2486196
  yasp.Debugger.formatNumber = function (d, padding, format) {
    var hex = Number(d).toString(format);
    while (hex.length < padding)
      hex = "0" + hex;
    return hex;
  };
})();
