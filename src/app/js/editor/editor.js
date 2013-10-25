if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.CompileManager = {
    lastCompile: null,
    compile: function(content, cb) {
      if (content != this.lastUpdate) {
        this.lastUpdate = content;
        console.log("update");
        yasp.AssemblerCommunicator.sendMessage("assemble", {
          code: content,
          jobs: ['symbols', 'map']
        }, function(response) {
          cb(response);
        });
      } else {
        cb(null);
      }
    }
  }
  yasp.CompileManager.compile = yasp.CompileManager.compile.bind(yasp.CompileManager);
  
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
      indentWithTabs: true,
      fullScreen: true
    });
    
    // update height
    /*setInterval(function() {
      editor.setSize({
        height: $('#editorcontainer').height()
      });
    }, 500);*/
    
    
    // force intendation everytime something changes
    editor.on("change", function() {
      var c = editor.getCursor();
      if (!!c) editor.indentLine(c.line);
    });
    
    // update symbols
    var UPDATE_DELAY = 500;
    var update;
    setTimeout(update = function() {
      var content = editor.getValue();
      yasp.CompileManager.compile(content, function(result) {
        setTimeout(update, UPDATE_DELAY)
      });
    }, UPDATE_DELAY);
  });
})();