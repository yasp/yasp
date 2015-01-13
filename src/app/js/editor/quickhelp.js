(function() {
  var QUICKHELP_DELAY = 500; // time between quickhelp updates

  yasp.Editor.quickhelp = {
    update: function () {
      var $helpqick = $('#help_quick');

      $helpqick.removeClass("fixed");
      $('#editorcontainer').removeClass("quickHelpFixed");
      $('#labellist').removeClass("quickHelpFixed");

      if(yasp.Storage['help'] == 'fix') {
        $helpqick.addClass("fixed");
        $('#editorcontainer').addClass("quickHelpFixed");
        $('#labellist').addClass("quickHelpFixed");
      }
    },
    init: function () {
      var prevCommand = null;

      function setQuickhelpCommand (command, singleLine) {
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
      }

      setInterval(function() {
        var c = yasp.DOMEditor.getCursor();
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
      }, QUICKHELP_DELAY);
    }
  };
})();
