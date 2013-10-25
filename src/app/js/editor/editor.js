if (typeof yasp == 'undefined') yasp = { };

(function() {
  var fireDataReceived;
  
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
          // update yasp.Editor
          if (!!response.payload) {
            yasp.Editor.map = response.payload.map;
            yasp.Editor.symbols = response.payload.symbols;
            
            fireDataReceived();
          }
          
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
    },
    labelText: ""
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
    var update, first = true;
    (update = function() {
      var content = editor.getValue();
      yasp.CompileManager.compile(content, function(result) {
        if (first) editor.setValue(content); // force update of existing labels
        
        first = false;
        setTimeout(update, UPDATE_DELAY)
      });
    })();
    
    // update label list
    fireDataReceived = function() {
      // build new label list text
      var text = "<ul>";
      var labels = yasp.Editor.symbols.labels;
      for (var l in labels) {
        text += "<li>" + l + "</li>";
      }
      text += "</ul>";
      
      $('#labelcontent').html(text);
    };
  });
})();