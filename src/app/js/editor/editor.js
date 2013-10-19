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
    
    var assembler = yasp.AssemblerCommunicator;
    
    // update symbols
    setTimeout(function() {
      assembler.sendMessage("assembler", {
        code: editor.getValue(),
        jobs: ['symbols', 'map']
      }, function() {
        
      });
    }, 500);
  });
})();