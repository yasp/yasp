(function() {
  yasp.Editor.labellist = {
    update: function () {
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
    },
    init: function () {
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
    },
    onCompile: function () {
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
    }
  };
})();