if (typeof yasp == 'undefined') yasp = { };
if (typeof yasp.Storage == 'undefined') yasp.Storage = localStorage || { };

(function() {
  /**
   * Initialize code mirror textarea and keeps track of every editor textarrea
   * @constructor
   */
  var EditorManager = function() {
    this.editors = [ ];
    this.applyFile(yasp.FileDialog.createEmptyFile());
  };

  /**
   * Calls a function for every editor associated with the EditorManager
   * @param func
   */
  EditorManager.prototype.apply = function(func) {
    for (var i = 0; i < this.editors.length; i++) {
      func(this.editors[i]);
    }
  };
  EditorManager.prototype.applyFile = function(file) {
    if (this.file != file) {
      this.file = file;
      // update content
      this.apply(function(editor) {
        // save scroll position
        var scrollInfo = editor.getScrollInfo();
        editor.setValue(file.content);
        editor.scrollIntoView(scrollInfo);
      });
    }
    // update filename
    $('#display_filename').text(file.filename ? file.filename : yasp.l10n.getTranslation("editor.toolbar.menu.untitled"));
    
  };
  EditorManager.prototype.getAndUpdateFile = function() {
    this.file.content = this.editors[0].getValue();
    return this.file;
  }
  EditorManager.prototype.reindent = function() {
    this.apply(function(e) {
      var val = e.getValue();
      for (var i = 0; i < val.length; i++) {
        e.indentLine(i, "smart");
      }
    });
  }
  
  /**
   * Creates an editor instance
   * @param domElement
   * @returns {*}
   */
  EditorManager.prototype.create = function(domElement) {
    var editor = CodeMirror.fromTextArea(domElement, {
      mode: "text/assembler",
      theme: yasp.Storage['theme'],
      lineNumbers: true,
      undoDepth: 100,
      autofocus: true,
      indentUnit: yasp.Storage['indentUnit'],
      tabSize: yasp.Storage['indentUnit'],
      indentWithTabs: true,
      gutters: ["CodeMirror-lint-markers", "breakpoints"],
      lint: true,
      extraKeys: {
        "Ctrl-Space": "autocompleteforce",
        "Ctrl-O": "open",
        "Ctrl-S": "save",
        "Shift-Ctrl-S": "saveas",
        "Ctrl-N": "new"
      }
    });
    editor.on("gutterClick", (function(cm, n) {
      this.apply((function(cm) {
        var info = cm.lineInfo(n);
        if(yasp.Editor.map[n + 1] === undefined)
          return;
        cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : (function() {
          var marker = $(document.createElement('div'));
          marker.css({
            "color": '#FF0000',
            "font-size": "125%",
            "position": "relative",
            "top": "-0.21em",
            "left": "-0.6em"
          });
          marker.text("●");
          return marker.get(0);
        })());

        yasp.Editor.updateBreakpoints();
      }).bind(this));
    }).bind(this));
    this.editors.push(editor);
    this.reindent();
    return editor;
  };
  
  yasp.EditorManager = new EditorManager();
})();

(function() {
  var UPDATE_DELAY = 500; // time between souce code is parsed
  var HINT_DELAY = 750; // time between hints are displayed
  
  
  var fireDataReceived;

  yasp.l10n.translateDocument();
  
  yasp.CompileManager = {
    lastCompile: null,
    commands: null,
    registers: null,
    update: function(params) {
      yasp.Editor.symbols = params.symbols;
      yasp.Editor.ast = params.ast;

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
    },
    compile: function(content, cb) {
      if (content != this.lastUpdate) {
        this.lastUpdate = content;
        yasp.AssemblerCommunicator.sendMessage("assemble", {
          code: content,
          jobs: ['symbols', 'map', 'ast', 'bitcode']
        }, function(response) {
          yasp.Editor.error = !!response.error ? response.error.errors : null;
          
          if (!!response.error && !!response.error.ast && !!response.error.symbols) {
            yasp.CompileManager.update.call(this, response.error);
            fireDataReceived();
          }
          
          if (!!response.payload) {
            yasp.CompileManager.update.call(this, response.payload);
            
            yasp.Editor.map = response.payload.map;
            yasp.Editor.bitcode = response.payload.bitcode;

            yasp.Editor.reverseMap = {};
            for (var line in yasp.Editor.map) {
              var bitPos = yasp.Editor.map[line];
              yasp.Editor.reverseMap[bitPos] = +line;
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
    orderedSymbols: [ ],
    error: [ ],
    labelText: "",
    breakpoints: [ ],
    ast: [ ],
    bitcode: new Uint8Array(),
    updateBreakpoints: function  () {
      var editor = yasp.EditorManager.editors[0];
      yasp.Editor.breakpoints = [];
      editor.eachLine(function (handle) {
        var info = editor.lineInfo(handle);
        yasp.Editor.breakpoints[info.line] = !!(info.gutterMarkers && info.gutterMarkers.breakpoints);
      });

      yasp.Debugger.breakpoints.offsetBreakpointsChanged(yasp.Editor.breakpoints);
    },
    getIdentifierOccurence: function(name) {
      if (!!yasp.Editor.symbols.instructions[name]) return yasp.Editor.symbols.instructions[name];
      if (!!yasp.Editor.symbols.usedRegisters[name]) return yasp.Editor.symbols.usedRegisters[name];
      return 0;
    }
  };
  
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
    
    
    // force reload of USB-Master image
    var usbmasterImg = new Image();
    usbmasterImg.src = "./app/img/usbmaster.png";

    if (typeof yasp.Storage['theme'] == 'undefined')           yasp.Storage['theme'] = 'eclipse';
    if (typeof yasp.Storage['indentUnit'] == 'undefined')      yasp.Storage['indentUnit'] = "8"; // localStorage saves as string
    if (typeof yasp.Storage['automaticsave'] == 'undefined')   yasp.Storage['automaticsave'] = "true";
    if (typeof yasp.Storage['codecompletion'] == 'undefined')  yasp.Storage['codecompletion'] = "true";
    if (typeof yasp.Storage['language'] == 'undefined')        yasp.Storage['language'] = ((navigator.language || navigator.userLanguage).substr(0, 2) == "de") ? "de" : "en";
    if (typeof yasp.Storage['labellist'] == 'undefined')       yasp.Storage['labellist'] = "slide";
    if (typeof yasp.Storage['help'] == 'undefined')       yasp.Storage['help'] = "slide";

    if(yasp.Storage['labellist'] == "true" || yasp.Storage['labellist'] == "false")
      yasp.Storage['labellist'] = "slide";
    if(yasp.Storage['help'] == "true" || yasp.Storage['help'] == "false")
      yasp.Storage['help'] = "slide";


    if(typeof yasp.Storage['firsttime'] == 'undefined') {
      var $popup = $('#tutorial_popup');
      $popup.css('display', 'block');
      $popup.find('.hideNow').click(function () {
        $('#tutorial_popup').css('display', 'none');
      });
      $popup.find('.hideAlways').click(function () {
        $('#tutorial_popup').css('display', 'none');
        yasp.Storage['firsttime'] = false;
      });
    }
    
    var editor = yasp.EditorManager.create($('#editor').get(0));
    
    // force intendation everytime something changes
    var changing = false;
    editor.on("change", function() {
      if (changing) return;

      yasp.Editor.updateBreakpoints();

      var c = editor.getCursor();
      if (!!c) {
        try {
          var content = editor.getLine(c.line);
          editor.indentLine(c.line);
          var newc = editor.getCursor();
          // fix bug introduced in Commit #32d7db0cf78f5ed9dde3450ad885ced98851271b that causes the input to be fucked up...
          if (editor.getLine(c.line) != content && (newc.ch == c.ch && newc.line == c.line)) { // if intendation changed something while the character kept the same
            newc.ch++; // if you ever add multiple levels of intendation this should be changed into somehting more intelligent
          }
          c = newc;
          editor.setCursor(c);
          
          setTimeout(function() { // fixes bug that causes the completition dialog to be immediately closed
            CodeMirror.commands.autocomplete(editor);
          }, 0);
        } finally {
          changing = false;
        }
      }
    });
    
    // update symbols
    var update, first = true;
    (update = function() {
      var lastSymbols = null;
      var content = editor.getValue();
      yasp.CompileManager.compile(content, function(result) {
        var currentSymbols = JSON.stringify(yasp.Editor.symbols);
        if (currentSymbols != lastSymbols) {
          lastSymbols = currentSymbols;
          editor.setOption("mode", editor.getOption("mode")); // CodeMirror dirty way of force highlighting by setting the mode (used to highlight labels in the correct color)
        }
        
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
          var label = yasp.Editor.symbols.labels[elem.text().toUpperCase()];
          if (!!label) {
            editor.scrollIntoView(CodeMirror.Pos(label.line, label.char), 32);
            editor.setCursor(CodeMirror.Pos(label.line - 1, 0));
            editor.focus();
          } else {
            console.log("Unknown label");
          }
        });
      
    };

    var updateHelpQuickVisiblity = function () {
      var $helpqick = $('#help_quick');

      $helpqick.removeClass("fixed");
      $('#editorcontainer').removeClass("quickHelpFixed");
      $('#labellist').removeClass("quickHelpFixed");

      if(yasp.Storage['help'] == 'fix') {
        $helpqick.addClass("fixed");
        $('#editorcontainer').addClass("quickHelpFixed");
        $('#labellist').addClass("quickHelpFixed");
      }
    };
    
    var updateLabelListVisiblity = function() {
      var $labellist = $('#labellist');

      $labellist.removeClass("hidden");
      $labellist.removeClass("fixed");
      $('#editorcontainer').removeClass("labelListFixed");

      if (yasp.Storage['labellist'] == "hide") {
        $labellist.addClass("hidden");
      } else if(yasp.Storage["labellist"] == "slide") {
        // standard mode
      } else if(yasp.Storage["labellist"] == "fix") {
        $labellist.addClass("fixed");
        $('#editorcontainer').addClass("labelListFixed");
      }
    };
    
    // menu & UI events
    (function() {
      updateHelpQuickVisiblity();
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
      
      $('.menu_open').click(function() {
        CodeMirror.commands.open(editor);
      });
      $('.menu_save').click(function() {
        CodeMirror.commands.save(editor);
      });
      $('.menu_saveas').click(function() {
        CodeMirror.commands.saveas(editor);
      });
      $('.menu_new').click(function() {
        CodeMirror.commands.new(editor);
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
          yasp.Storage['theme'] = this.value;
          yasp.EditorManager.apply((function(e) {
            e.setOption("theme", this.value);
          }).bind(this));
        }).val(editor.getOption("theme"));
        
        $('#tab_picker').change(function() {
          yasp.Storage['indentUnit'] = this.value;
          yasp.EditorManager.apply((function(e) {
            e.setOption("indentUnit", +this.value);
            e.setOption("indentWithTabs", true);
            e.setOption("tabSize", +this.value);
            yasp.EditorManager.reindent();
          }).bind(this));
        }).val(+editor.getOption("indentUnit"));

        $('#language_picker').change(function() {
          yasp.Storage['language'] = this.value;
          yasp.l10n.translateDocument();
          yasp.EditorManager.apply((function(e) {
            e.setOption("language", this.value);
          }).bind(this));
        }).val(yasp.Storage['language']);
        
        $('#automaticsave_picker').change(function() {
          yasp.Storage['automaticsave'] = this.checked;
        }).attr('checked', yasp.Storage['automaticsave'] == "true" ? true : false);
        
        $('#codecompletion_picker').change(function() {
          yasp.Storage['codecompletion'] = this.checked;
        }).attr('checked', yasp.Storage['codecompletion'] == "true" ? true : false);

        $('#labellist_picker').change(function() {
          yasp.Storage['labellist'] = this.value;
          updateLabelListVisiblity();
        }).val(yasp.Storage['labellist']);
        
        $('#help_picker').change(function() {
          yasp.Storage['help'] = this.value;
          updateHelpQuickVisiblity();
        }).val(yasp.Storage['help']);
      });
      $('.menu_about').click(function() {
        $('#dialog_about').modal({
          'keyboard': true
        });
      });

      function showDebugger (mode) {
        // compile
        yasp.CompileManager.compile(editor.getValue(), function(data) {
          if (!yasp.Editor.error || yasp.Editor.error.length == 0) {
            yasp.Debugger.show(mode); // open debugger
          } else {
            console.log("Invalid code");
            // TODO implement proper error dialog
          }
        });
      }

      $('.menu_run').click(function() {
        showDebugger("run");
      });

      $('.menu_debug').click(function() {
        showDebugger("debug");
      });

      $('.menu_share').click(function () {
        $.ajax({
          type: "POST",
          url: "https://yasp.firebaseIO.com/codes.json",
          data: JSON.stringify({ code: editor.getValue() }),
          success: function (data) {
            var name = data.name;
            var url = document.location.href.split('#')[0];
            if(url.charAt(url.length - 1) !== "/")
              url += "/"
            url += "#q=" + name;

            prompt(yasp.l10n.getTranslation("editor.toolbar.quickshare.msg"), url);
            location.replace(url);
          }
        });
      });

      function fixHelpHeight() {
        $('#help_container').css('height', ($(window).height() - 250) + "px");
      }

      fixHelpHeight();
      $(window).resize(fixHelpHeight);
      
      $('.menu_help').click(function() {
        switch(yasp.l10n.getLangName()) {
          case "en":
            $('.lang_en').css({'display': 'block'});
            $('.lang_de').css({'display': 'none'});
            break;
          case "de":
            $('.lang_en').css({'display': 'none'});
            $('.lang_de').css({'display': 'block'});
            break;
        }
        $('#dialog_help').modal({
          'keyboard': true
        });
      });

      $('#dialog_help').on('shown.bs.modal', function () {
        $('#help_search > input').focus();
      });
    })();
    
    // load help data
    $.ajax('app/help/help.html').done(function(responseText) {
      $('#help_container').append($(responseText)[4]);
    }).fail(function() {
      console.log("failed to load help");
    });

    // init help search
    $('#help_search > input').keyup(function () {
      var text = $('#help_search > input').val().toLowerCase();
      var commands = $('#help_container .command');

      for (var i = 0; i < commands.length; i++) {
        var $cmd = $(commands[i]);
        if($cmd.text().toLowerCase().indexOf(text) !== -1)
          $cmd.show();
        else
          $cmd.hide();
      }
    });
    
    // update help rendering parameters
    var setQuickhelpCommand = function(command, singleLine) {
      var desc = command.doc[yasp.l10n.getLangName()];
      var cmdStr = "";

      if (command.name instanceof Array) {
        cmdStr = command.name.join(' | ').toUpperCase();
      } else {
        cmdStr = command.name.toUpperCase();
      }

      cmdStr += " ";

      for (var j = 0; j < command.params.length; j++) {
        if (j > 0) cmdStr += ", ";

        switch (command.params[j].type) {
          case "r_byte":
            cmdStr += "Byte-Register";
            break;
          case "r_word":
            cmdStr += "Word-Register";
            break;
          case "l_byte":
            cmdStr += "Byte-Literal";
            break;
          case "l_word":
            cmdStr += "Word-Literal";
            break;
          case "pin":
            cmdStr += "Pin";
            break;
          case "address":
            cmdStr += "Label";
            break;
          default:
            cmdStr += param.type;
            break;
        }
      }

      var commandDiv = $('<div></div>').addClass("command").html("<b>"+cmdStr+"</b>");
      var descDiv = $('<div></div>').addClass("desc").html(desc.description);

      if(singleLine) {
        commandDiv.css('display', 'inline-block');
        descDiv.css('display', 'inline-block');
        descDiv.css('margin-left', '0.3em');
      }

      $('#help_quick .helpquick_container')
        .append(commandDiv)
        .append(descDiv);

      if(!singleLine) {
        var flagsDiv = $('<div></div>').addClass("flags").empty();
        var flagsDescrDiv = $('<div></div>').text(yasp.l10n.getTranslation("editor.helpquick.flags")).addClass("flagsDescr").addClass('hidden');

        if (!!desc.flags && Object.keys(desc.flags).length > 0) {
          for (var flag in desc.flags) {
            var $flag = $('<li><span class="name"></span>: <span class="condition"></span></li>');
            $flag.find('.name').text(flag);
            $flag.find('.condition').text(desc.flags[flag]);
            flagsDiv.append($flag);
          }
          flagsDescrDiv.removeClass('hidden');
        }

        $('#help_quick .helpquick_container')
          .append(flagsDescrDiv)
          .append(flagsDiv);
      }
    };
    
    var prevCommand = null;
    setInterval(function() {
      var c = editor.getCursor();
      var found = false;
      var changed = false;
      var height = 0;
      
      
      if (!!c && yasp.Storage['help'] != "hide") {
        for (var i = 0; i < yasp.Editor.ast.length; i++) {
          var entry = yasp.Editor.ast[i];
          if (entry.token.line == (c.line + 1)) {   
            if (entry.type.name == "command" && !!entry.params.command) {
              var command = entry.params.command;
              if (prevCommand != command) {
                changed = true;
                prevCommand = command;
              
                $('#help_quick .helpquick_container').html("");
                setQuickhelpCommand(command, false);
              }
              found = true;
            } else if (entry.type.name == "unknowncommand" && !!entry.params.possibleCommands) {
              var commands = entry.params.possibleCommands;
              
              if (prevCommand != commands) {
                changed = true;
                prevCommand = commands;

                var multiple = (commands.length > 1);
                
                $('#help_quick .helpquick_container').html("");
                for (var j = 0; j < commands.length; j++) {
                  setQuickhelpCommand(commands[j], multiple);
                  if (j < commands.length - 1) {
                    $('#help_quick .helpquick_container').append($('<hr />'));
                  }
                }
              }
               
              found = true;
            }
            
            if (changed) {
              height = $('#help_quick .helpquick_container').height() + 32;
            }
            break;
          }
        }
      }
      
      if (!found && $('#help_quick .helpquick_container').html() !== "") {
        changed = true;
        $('#help_quick .helpquick_container').html(""); // clear children
      }

      if (changed) {
        if(yasp.Storage['help'] == "slide") {
          $('#help_quick').animate({
            height: height + "px"
          }, "fast");
        }
      }
    }, 500);

    var isQuickshare = (window.location.hash.indexOf('#q=') === 0);
    
    // automatic save
    setInterval(function() {
      // check if automatic save is on
      if (yasp.Storage['automaticsave'] == "true") {
        // is there a name associated with this file?
        var file = yasp.EditorManager.file;
        if (!file.filename) {
          // no? => Create empty file
          file = yasp.FileDialog.createEmptyFile();
          file.content = yasp.EditorManager.editors[0].getValue();
          file.filename = "Automatic Save";
          yasp.EditorManager.applyFile(file);
        }
        
        // save it baby
        yasp.FileDialog.show(yasp.FileDialogMode.SAVE);
      }
    }, 2500); // save every 5 seconds
    
    // automatically load automatic save if exists on startup
    if (yasp.Storage['automaticsave'] == "true" && !isQuickshare) {
      yasp.FileDialog.FileSystemDriver.LOCAL.openFile("Automatic Save", function(file) {
        if (!!file) yasp.EditorManager.applyFile(file);
      });
    }

    if(isQuickshare) {
      var hash = window.location.hash.substr(3);
      $.ajax({
        type: "GET",
        url: "https://yasp.firebaseIO.com/codes/" + hash + ".json",
        success: function (data) {
          var content = data.code;
          if (!!content) {
            yasp.FileDialog.FileSystemDriver.LOCAL.newFile("Quick Share File", function(file) {
              var save = function() {
                file.content = content;
                yasp.FileDialog.FileSystemDriver.LOCAL.saveFile(file, function() {
                  yasp.EditorManager.applyFile(file); // gotta love callbacks
                });
              };
              if (!file) {
                yasp.FileDialog.FileSystemDriver.LOCAL.openFile("Quick Share File", function(realfile) {
                  file = realfile;
                  save();
                })
              } else {
                save();
              }
            });
          }
        }
      });
    }
    
    // hinting
    (function() {
      var delimiters = yasp.Lexer.getDelimiters();
      CodeMirror.registerHelper("hint", "assembler", function(editor, options) {
        var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
        var start = cur.ch, end = start;
        while (end < curLine.length && delimiters.indexOf(curLine.charAt(end)) == -1) ++end;
        while (start && delimiters.indexOf(curLine.charAt(start - 1)) == -1) --start;
        
        var symbols = [];
        // AST?
        var found = false;
        for (var i = 0; i < yasp.Editor.ast.length; i++) {
          var entry = yasp.Editor.ast[i];
          if (entry.token.line == (cur.line + 1) && (entry.type.name == "unknowncommand" && !!entry.params.possibleCommands)) {
            found = true;
            var commands = entry.params.possibleCommands;
            
            // check where i am
            var isIn = false;
            var expectedTypes = [ ];
            expectedTypes.contains = (function(a) {
              for (var j = 0; j < this.length; j++) {
                if (this[j] == a) return true;
              }
              return false;
            }).bind(expectedTypes);
            
            for (var j = 0; j < entry.params.params.length; j++) {
              var token = entry.params.params[j];
              if (cur.ch >= token.char && cur.ch < token.char + token.text.length) {
                for (var k = 0; k < commands.length; k++) {
                  if (k < commands[k].params.length) {
                    if (!expectedTypes.contains(commands[k].params[j].type)) expectedTypes.push(commands[k].params[j].type);
                  }
                }
                isIn = true;
              }
            }
            
            if (!isIn) {
              for (var k = 0; k < commands.length; k++) {
                var pos = Math.min(entry.params.params.length, commands[k].params.length-1);
                if (!expectedTypes.contains(commands[k].params[pos].type)) expectedTypes.push(commands[k].params[pos].type);
              }
            }
            
            // now add symbols
            for (var j = 0; j < expectedTypes.length; j++) {
              var type = expectedTypes[j];
              switch (type) {
                case "r_byte":
                  var usedRegisters = yasp.Editor.symbols.usedRegisters;
                  for (var k in usedRegisters) {
                    if (k.charAt(0) == 'B') symbols.push(k);
                  }
                  if (!yasp.CompileManager.registers) yasp.CompileManager.registers = yasp.Lexer.getRegisters();
                  for (var k = 0; k < yasp.CompileManager.registers.length; k++) {
                    if (!usedRegisters[yasp.CompileManager.registers[k]] && yasp.CompileManager.registers[k].charAt(0) == 'B') symbols.push(yasp.CompileManager.registers[k]);
                  }
                  break;
                case "r_word":
                  var usedRegisters = yasp.Editor.symbols.usedRegisters;
                  for (var k in usedRegisters) {
                    if (k.charAt(0) == 'W') symbols.push(k);
                  }
                  if (!yasp.CompileManager.registers) yasp.CompileManager.registers = yasp.Lexer.getRegisters();
                  for (var k = 0; k < yasp.CompileManager.registers.length; k++) {
                    if (!usedRegisters[yasp.CompileManager.registers[k]] && yasp.CompileManager.registers[k].charAt(0) == 'W') symbols.push(yasp.CompileManager.registers[k]);
                  }
                  break;
                case "l_byte":
                  for (var k = 0; k < Math.pow(2, 8); k++) {
                    symbols.push(k+"");
                  }
                  break;
                case "l_word":
                  if (!expectedTypes.contains('l_byte')) {
                    for (var k = 0; k < Math.pow(2, 8); k++) {
                      symbols.push(k+"");
                    }
                  }
                  break;
                case "pin":
                  for (var k = 0; k < Math.pow(2, 5); k++) {
                    symbols.push(k+"");
                  }
                  break;
                case "address":
                  var labels = yasp.Editor.symbols.labels;
                  for (var k in labels) {
                    symbols.push(labels[k].text);
                  }
                  break;
              }
            }
            if (expectedTypes.length > 0) {
              // add defines
              var defines = yasp.Editor.symbols.defines;
              for (var k in defines) {
                symbols.push(k);
              }
            }
            
            break;
          }
        }
        var curWord = start != end && curLine.slice(start, end);
        if (!found) {
          
          if (!!curWord) {
            curWord = curWord.toUpperCase();
          } else {
            if (options.force) {
              curWord = "";
            } else {
              curWord = null;
            }
          }
          
          var osymbols = yasp.Editor.orderedSymbols;
          for (var i = 0; i < osymbols.length && curWord != null; i++) {
            if ((osymbols[i].toUpperCase().indexOf(curWord) == 0 && osymbols[i].toUpperCase() != curWord)) {
              symbols.push(osymbols[i]);
            }
          }
        }
        
        // is current word in symbols exactly? if so, do not show any
        if (!!curWord && !options.force) {
          curWord = curWord.toUpperCase();
          for (var i = 0; i < symbols.length; i++) {
            if (symbols[i].toUpperCase() == curWord) {
              // yep
              return {list: [ ], from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
            }
          }
        }
        
        return {list: symbols, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
      });
      
      CodeMirror.commands.autocomplete = function(cm) {
        if (yasp.Storage['codecompletion'] == "true") {
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
      CodeMirror.commands.save = function(cm) {
        yasp.FileDialog.show(yasp.FileDialogMode.SAVE);
      };
      CodeMirror.commands.saveas = function(cm) {
        yasp.FileDialog.show(yasp.FileDialogMode.SAVEAS);
      };
      CodeMirror.commands.open = function(cm) {
        yasp.FileDialog.show(yasp.FileDialogMode.OPEN);
      };
      CodeMirror.commands.new = function(cm) {
        yasp.FileDialog.show(yasp.FileDialogMode.NEW);
      };
    })();
  });
})();