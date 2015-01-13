(function() {
  yasp.Editor.help = {
    init: function () {
      // load help data
      $.ajax('app/help/help.html').done(function (responseText) {
        $('#help_container').append($(responseText)[4]);
      }).fail(function () {
        console.log("failed to load help");
      });

      $('#dialog_help').on('shown.bs.modal', function () {
        $('#help_search > input').focus();
      });

      function fixHelpHeight() {
        $('#help_container').css('height', ($(window).height() - 275) + "px");
      }

      fixHelpHeight();
      $(window).resize(fixHelpHeight);

      function refreshSearch() {
        var needle = $('#help_search > input').val().toLowerCase();
        var cmdmode = $('#help_search_onlycmd').prop('checked');
        var commands = $('#help_container .command');

        for (var i = 0; i < commands.length; i++) {
          var $cmd = $(commands[i]);
          var haystack;

          if (cmdmode) {
            haystack = $cmd.children('h1').text();
          } else {
            haystack = $cmd.text();
          }

          if (haystack.toLowerCase().indexOf(needle) !== -1)
            $cmd.show();
          else
            $cmd.hide();
        }
      }

      $('#help_search > input').keyup(refreshSearch);
      $('#help_search_onlycmd').change(refreshSearch);
    }
  };
})();
