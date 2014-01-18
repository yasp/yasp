if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.Debugger = {
    show: function(mode) {
      $('#dialog_debugger').modal('show');

      if (!!yasp.Debugger.EmulatorCommunicator) yasp.EmulatorCommunicator.terminate();
      yasp.Debugger.EmulatorCommunicator = new yasp.Communicator("app/js/emulator/emulator_backend.js");
      yasp.Debugger.mode = mode;
      yasp.Debugger.isEmulatorRunning = false;
      yasp.Debugger.lastExecutedLine = 0;

      yasp.Debugger.debugLog.clearLog();

      yasp.Debugger.lastRom = null;
      yasp.Debugger.lastRam = null;

      yasp.Debugger.registers.heading.empty();
      yasp.Debugger.registers.snapshots.empty();

      yasp.Debugger.registers.heading.append('<div class="flag">C</div>');
      yasp.Debugger.registers.heading.append('<div class="flag">Z</div>');
      yasp.Debugger.registers.heading.append('<div class="pointer">PC</div>');
      yasp.Debugger.registers.heading.append('<div class="pointer">SP</div>');

      for (var reg in yasp.Editor.symbols.usedRegisters) {
        yasp.Debugger.registers.heading.append(
          $('<div class="register">' + reg.toLowerCase() + '</div>').addClass(reg[0] === "B" ? "byte" : "word")
        );
      }
    },
    debugLog: {
      addLog: function (str) {
        yasp.Debugger.debugLog.element.text(yasp.Debugger.debugLog.element.text() + str);
        yasp.Debugger.debugLog.element.scrollTop(yasp.Debugger.debugLog.element[0].scrollHeight);
      },
      clearLog: function () {
        yasp.Debugger.debugLog.element.text("");
      }
    },
    states: [],
    registers: {
      addSnapshot: function (regs) {
        var $snap = $('<div>');
        var i = 0;

        var lastSnap = $(yasp.Debugger.registers.snapshots.children()[0]);
        $snap.append('<div class="number">' + yasp.Debugger.registers.snapshots.children().length + '</div>');

        for (var reg in regs) {
          var $reg = $('<div>');

          if(reg === "C" || reg === "Z") {
            $reg.text(regs[reg] ? "1" : "0");
            $reg.addClass("flag");
          }

          if(reg === "PC" || reg === "SP") {
            $reg.text(formatHexNumber(regs[reg], 4));
            $reg.addClass("pointer");
          }

          if(reg === "SP") {
            $reg.text(regs[reg]);
            $reg.addClass("pointer");
          }

          if(reg[0] === "B") {
            $reg.text(formatHexNumber(regs[reg], 2));
            $reg.addClass("register byte");
          }
          else if(reg[0] === "W") {
            $reg.text(formatHexNumber(regs[reg], 4));
            $reg.addClass("register word");
          }

          if(lastSnap.length > 0 && $reg.text() != $(lastSnap.children()[i + 1]).text())
            $reg.addClass("changed");

          $snap.append($reg);
          i++;
        }

        yasp.Debugger.registers.snapshots.prepend($snap);
      },
      setStack: function (stack) {
        var str = "";

        for (var i = 0; i < stack.length; i++) {
          str += (i === stack.length - 1) ? "> " : "  ";
          str += formatHexNumber(stack[i], 2) + "\n";
        }

        yasp.Debugger.registers.stack.text(str);
        yasp.Debugger.registers.stack.scrollTop(yasp.Debugger.registers.stack[0].scrollHeight);
      }
    }
  };

  $('body').ready(function() {
    yasp.Debugger.editor = yasp.EditorManager.create($('#debugger_editor').get(0));
    yasp.Debugger.editor.swapDoc(yasp.EditorManager.editors[0].linkedDoc({
      sharedHist: true
    }));
    yasp.Debugger.editor.setOption('readOnly', "nocursor");
    yasp.Debugger.debugLog.element = $('#debugger-tabs-debug > pre:first');

    $('#dialog_debugger').modal({
      'show': false,
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

      yasp.Debugger.editor.removeLineClass(yasp.Debugger.lastExecutedLine, 'background', 'line-active');

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
      yasp.Debugger.EmulatorCommunicator.sendMessage("CONTINUE", {
        count: null
      });
    });

    $('.debugger-tabs-debug-clear').click(yasp.Debugger.debugLog.clearLog);

    yasp.Debugger.registers.heading = $('#debugger-tabs-registers > .registers > .heading');
    yasp.Debugger.registers.snapshots = $('#debugger-tabs-registers > .registers > .snapshots');
    yasp.Debugger.registers.stack = $('#debugger-tabs-registers > .stack > pre');
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

      yasp.Debugger.debugLog.addLog(msg.subtype + msg.addr + ": 0x" + val + "\n");
    } else if(msg.type === "string") {
      yasp.Debugger.debugLog.addLog(msg.val + "\n");
    }
  }

  function refreshDebugger() {
    yasp.Debugger.EmulatorCommunicator.sendMessage("GET_STATE", {},
      function (data) {
        var state = data.payload;

        yasp.Debugger.states.push(state);

        renderBytes(state.ram, 0x10, $('#debugger-ramdump'));
        if(yasp.Debugger.lastRam)
          colorChangedBytes(getChangedBytes(state.ram, yasp.Debugger.lastRam), $('#debugger-ramdump'));
        yasp.Debugger.lastRam = state.ram;

        renderBytes(state.rom, 0x10, $('#debugger-romdump'));
        if(yasp.Debugger.lastRom)
          colorChangedBytes(getChangedBytes(state.rom, yasp.Debugger.lastRom), $('#debugger-romdump'));
        yasp.Debugger.lastRom = state.rom;

        var snap = {};

        snap["C"] = state.registers.flags["C"];
        snap["Z"] = state.registers.flags["Z"];

        snap["PC"] = state.registers.special["pc"];
        snap["SP"] = state.registers.special["sp"];

        for (var reg in yasp.Editor.symbols.usedRegisters) {
          snap[reg] = state.registers.general[reg[0].toLowerCase()][reg.substr(1)];
        }

        yasp.Debugger.registers.addSnapshot(snap);

        yasp.Debugger.registers.setStack(state.stack);

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

  // http://stackoverflow.com/a/57807/2486196
  function formatHexNumber(d, padding) {
    var hex = Number(d).toString(16);
    while (hex.length < padding)
      hex = "0" + hex;
    return hex;
  }
})();

