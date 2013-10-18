if (typeof yasp == 'undefined') yasp = { };

(function() {
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
    
  });
})();