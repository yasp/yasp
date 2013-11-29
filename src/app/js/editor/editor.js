if (typeof yasp == 'undefined') yasp = { };

(function() {
  var storage = localStorage || { };
  var UPDATE_DELAY = 500; // time between souce code is parsed
  var HINT_DELAY = 750; // time between hints are displayed
  
  
  var fireDataReceived;
  
  yasp.CompileManager = {
    lastCompile: null,
    commands: null,
    registers: null,
    compile: function(content, cb) {
      if (content != this.lastUpdate) {
        this.lastUpdate = content;
        console.log("update");
        yasp.AssemblerCommunicator.sendMessage("assemble", {
          code: content,
          jobs: ['symbols', 'map']
        }, function(response) {
          yasp.Editor.error = !!response.error ? response.error.errors : null;
          if (!!response.payload) {
            yasp.Editor.map = response.payload.map;
            yasp.Editor.symbols = response.payload.symbols;
            
            // update orderedSymbols
            var osymbols = yasp.Editor.orderedSymbols;
            osymbols.length = 0;
            var instructions = yasp.Editor.symbols.instructions;
            for (var k in instructions) {
              osymbols.push(k);
            }
            var labels = yasp.Editor.symbols.labels;
            for (var k in labels) {
              osymbols.push(labels[k].text);
            }
            var usedRegisters = yasp.Editor.symbols.usedRegisters;
            for (var k in usedRegisters) {
              osymbols.push(k);
            }
            var defines = yasp.Editor.symbols.defines;
            for (var k in defines) {
              osymbols.push(k);
            }
            osymbols.sort(function(a, b) {
              var aCount = yasp.Editor.getIdentifierOccurence(a);
              var bCount = yasp.Editor.getIdentifierOccurence(b);
              
              return bCount - aCount;
            });
            
            // init commands if uninitialized
            if (!this.commands) {
              this.commands = [ ];
              var added = { }
              for (var i = 0; i < yasp.commands.length; i++) {
                var commandName = yasp.commands[i].name;
                for (var j = 0; j < (commandName instanceof Array ? commandName.length : 1); j++) {
                  var name = commandName instanceof Array ? commandName[j] : commandName;
                  if (!added[name] && !yasp.Editor.symbols.instructions[name] && name != null) {
                    this.commands.push(name);
                    added[name] = 42;
                  }
                }
              }
              this.commands.sort();
            }
            
            // add commands
            var added = { }
            for (var i = 0; i < this.commands.length; i++) {
              var name = this.commands[i];
              if (!added[name] && !yasp.Editor.symbols.instructions[name] && name != null) {
                osymbols.push(name);
                added[name] = 42;
              }
            }
            
            // init registers
            if (!this.registers) this.registers = yasp.Lexer.getRegisters();
            
            // add registers
            for (var i = 0; i < this.registers.length; i++) {
              if (!usedRegisters[this.registers[i]]) osymbols.push(this.registers[i]);
            }
            
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
      usedRegisters: { },
      defines: { }
    },
    orderedSymbols: [],
    error: [],
    labelText: "",
    getIdentifierOccurence: function(name) {
      if (!!yasp.Editor.symbols.instructions[name]) return yasp.Editor.symbols.instructions[name];
      if (!!yasp.Editor.symbols.usedRegisters[name]) return yasp.Editor.symbols.usedRegisters[name];
      return 0;
    }
  };
  
  yasp.EmulatorCommunicator = new yasp.Communicator("app/js/emulator/emulator_backend.js");
  yasp.AssemblerCommunicator = new yasp.Communicator("app/js/assembler/assembler_backend.js");
  
  $('body').ready(function() {
    // linting
    (function() {
      CodeMirror.registerHelper("lint", "assembler", function(text) {
        var result = [ ];
        var errs = yasp.Editor.error;
        if (!!errs) {
          for (var i = 0; i < errs.length; i++) {
            var err = errs[i];
            result.push({
              from: CodeMirror.Pos(err.line-1, 0),
              to: CodeMirror.Pos(err.line-1, err.char),
              message: err.message,
              severity: err.type
            });
          }
        }
        
        return result;
      });
    })();
    
    
    if (typeof storage['theme'] == 'undefined')           storage['theme'] = 'eclipse';
    if (typeof storage['indentUnit'] == 'undefined')      storage['indentUnit'] = "8"; // localStorage saves as string
    if (typeof storage['automaticsave'] == 'undefined')  storage['automaticsave'] = "true";
    if (typeof storage['codecompletion'] == 'undefined')  storage['codecompletion'] = "true";
    if (typeof storage['language'] == 'undefined')        storage['language'] = "English";
    if (typeof storage['labellist'] == 'undefined')       storage['labellist'] = "true";

    // initialize code mirror textarea
    var editor = CodeMirror.fromTextArea($('#editor').get(0), {
      mode: "text/assembler",
      theme: storage['theme'],
      lineNumbers: true,
      undoDepth: 100,
      autofocus: true,
      indentUnit: storage['indentUnit'],
      tabSize: storage['indentUnit'],
      indentWithTabs: true,
      gutters: ["CodeMirror-lint-markers"],
      lint: true,
      extraKeys: {
        "Ctrl-Space": "autocompleteforce"
      }
    });
    
    // force intendation everytime something changes
    editor.on("change", function() {
      var c = editor.getCursor();
      if (!!c) {
        var content = editor.getLine(c.line);
        editor.indentLine(c.line);
        // fix bug introduced in Commit #32d7db0cf78f5ed9dde3450ad885ced98851271b that causes the input to be fucked up...
        if (editor.getLine(c.line) != content) {
          c.ch++; // if you ever add multiple levels of intendation this should be changed into somehting more intelligent
        }
        editor.setCursor(c);
        
        setTimeout(function() { // fixes bug that causes the completition dialog to be immediately closed
          CodeMirror.commands.autocomplete(editor);
        }, 0);
      }
    });
    
    // update symbols
    var update, first = true;
    (update = function() {
      var content = editor.getValue();
      yasp.CompileManager.compile(content, function(result) {
        if (first) editor.setValue(content); // force update of existing labels, VERY dirty
        first = false;
        
        setTimeout(update, UPDATE_DELAY)
      });
    })();
    
    // update label list
    fireDataReceived = function() {
      // build new label list text
      var text = "<h4>Labels</h4><ul>";
      var labels = yasp.Editor.symbols.labels;
      for (var l in labels) {
        text += "<li><a class='labellink'>" + labels[l].text + "</a></li>";
      }
      text += "</ul>";
      
      $('#labellist')
        .html(text)
        .find('.labellink')
        .click(function(e) {
          var elem = $(this);
          console.log("Jump to "+elem.text());
          var label = yasp.Editor.symbols.labels[elem.text().toUpperCase()];
          if (!!label) {
            editor.scrollIntoView(CodeMirror.Pos(label.line, label.char), 32);
            editor.setCursor(CodeMirror.Pos(label.line, label.char));
          } else {
            console.log("Unknown label");
          }
        });
      
    };
    
    var updateLabelListVisiblity = function() {
      var mode;
      if (storage['labellist'] == "false") { // hide label list if deactivated
        mode = "none";
      } else {
        mode = "block";
      }
      $('#labellist').css({
        'display': mode
      });
    };
    
    // menu & UI events
    (function() {
      updateLabelListVisiblity();
      
      $('#labellist').hover(function() {
        $(this).filter(':not(:animated)').animate({
          'marginLeft': '-100px',
          'opacity': '1'
        }, 'fast');
      }, function() {
        $(this).animate({
          'marginLeft': '-20px',
          'opacity': '0.5'
        }, 'fast');
      });
      
      $('.menu_undo').click(function() {
        editor.undo();
      });
      $('.menu_redo').click(function() {
        editor.redo();
      });
      $('.menu_find').click(function() {
        CodeMirror.commands.find(editor);
      });
      $('.menu_replace').click(function() {
        CodeMirror.commands.replace(editor);
      });
      $('.menu_go2line').click(function() {
        editor.openDialog('Go to line: <input type="text" style="width: 10em"/>', function(line) {
          line = +line-1;
          if (line >= 0 && line < editor.lineCount()) {
            editor.scrollIntoView(CodeMirror.Pos(+line, 0), 32);
            editor.setCursor(CodeMirror.Pos(+line, 0));
          } else {
            console.log("invalid line");
          }
        });
      });
      $('.menu_settings').click(function() {
        $('#dialog_settings').modal({
          'keyboard': true
        });
        
        $('#theme_picker').change(function() {
          storage['theme'] = this.value;
          editor.setOption("theme", this.value);
        }).val(editor.getOption("theme"));
        
        $('#tab_picker').change(function() {
          storage['indentUnit'] = this.value;
          editor.setOption("indentUnit", +this.value);
          editor.setOption("tabSize", +this.value);
        }).val(+editor.getOption("indentUnit"));

        $('#language_picker').change(function() {
          storage['language'] = this.value;
          editor.setOption("language", this.value);
        }).val(storage['language']);
        
        $('#automaticsave_picker').change(function() {
          storage['automaticsave'] = this.checked;
        }).attr('checked', storage['automaticsave'] == "true" ? true : false);
        
        $('#codecompletion_picker').change(function() {
          storage['codecompletion'] = this.checked;
        }).attr('checked', storage['codecompletion'] == "true" ? true : false);

        $('#labellist_picker').change(function() {
          storage['labellist'] = this.checked;
          updateLabelListVisiblity();
        }).attr('checked', storage['labellist'] == "true" ? true : false);

      });
      $('.menu_about').click(function() {
        $('#dialog_about').modal({
          'keyboard': true
        });
      });
    })();
    
    // hinting
    (function() {
      var delimiters = yasp.Lexer.getDelimiters();
      CodeMirror.registerHelper("hint", "assembler", function(editor, options) {
        var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
        var start = cur.ch, end = start;
        while (end < curLine.length && delimiters.indexOf(curLine.charAt(end)) == -1) ++end;
        while (start && delimiters.indexOf(curLine.charAt(start - 1)) == -1) --start;
        var curWord = start != end && curLine.slice(start, end);
        if (!!curWord) {
          curWord = curWord.toUpperCase();
        } else {
          if (options.force) {
            curWord = "";
          } else {
            curWord = null;
          }
        }
        
        console.log("Current Word: '"+curWord+"'");
        
        var symbols = [];
        
        var osymbols = yasp.Editor.orderedSymbols;
        for (var i = 0; i < osymbols.length && curWord != null; i++) {
          if ((osymbols[i].toUpperCase().indexOf(curWord) == 0 && osymbols[i].toUpperCase() != curWord)) {
            symbols.push(osymbols[i]);
          }
        }
        
        return {list: symbols, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
      });
      
      CodeMirror.commands.autocomplete = function(cm) {
        if (storage['codecompletion'] == "true") {
          var cursor = editor.getCursor();
          setTimeout(function() {
            var newCursor = editor.getCursor();
            if (cursor && newCursor && cursor.line == newCursor.line && cursor.ch == newCursor.ch) {
              CodeMirror.showHint(cm, CodeMirror.hint.assembler, {
                completeSingle: false,
                alignWithWord: false,
                closeOnUnfocus: true,
                force: false
              });
            }
          }, HINT_DELAY);
        }
      };
      CodeMirror.commands.autocompleteforce = function(cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.assembler, {
          completeSingle: true,
          alignWithWord: false,
          closeOnUnfocus: true,
          force: true
        });
      };
    })();
  });
})();