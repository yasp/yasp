if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.Editor = {
    map: { },
    symbols: {
      labels: { },
      instructions: { },
      usedRegisters: { }
    }
  };
  
  
  // yasp.EmulatorCommunicator = new yasp.Communicator("emulator/emulator.js");
  yasp.AssemblerCommunicator = new yasp.Communicator("app/js/assembler/assembler_backend.js");
  
  $('body').ready(function() {
    // initialize code mirror textarea
    var editor = CodeMirror.fromTextArea($('#editor').get(0), {
      mode: "text/assembler",
      theme: 'eclipse',
      lineNumbers: true,
      undoDepth: 100,
      autofocus: true,
      indentUnit: 8,
      tabSize: 8,
      indentWithTabs: true
    });
    
    // force intendation everytime something changes
    editor.on("change", function() {
      var c = editor.getCursor();
      if (!!c) editor.indentLine(c.line);
    });
    
    // update symbols
    var UPDATE_DELAY = 500;
    var update, lastUpdate;
    setTimeout(update = function() {
      var content = editor.getValue();
      if (content != lastUpdate) {
        lastUpdate = content;
        console.log("update");
        yasp.AssemblerCommunicator.sendMessage("assemble", {
          code: content,
          jobs: ['symbols', 'map']
        }, function() {
          console.log("FINISH");

          setTimeout(update, UPDATE_DELAY);
        });
      } else {
        setTimeout(update, UPDATE_DELAY);
      }
    }, UPDATE_DELAY);
  });
})();