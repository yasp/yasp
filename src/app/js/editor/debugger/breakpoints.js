if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var breakpoints = {};
  yasp.Debugger.breakpoints = breakpoints;

  breakpoints.inactiveBreakpoints = [];
  breakpoints.offsetBreakpoints = [];
  breakpoints.currentHit = null;

  breakpoints.onInit = function () {
    breakpoints.table = $('#debugger-tabs-breakpoints > table.breakpoints');
    yasp.tabletools.clear(breakpoints.table);
  };

  breakpoints.onOpen = function () {
    breakpoints.sendBreakpoints();
    breakpoints.list.checkForEmpty();
    yasp.Debugger.breakpointHit = false;
  };

  breakpoints.onContinue = function () {
    breakpoints.currentHit = null;
    breakpoints.table.find('tr').removeClass('hit');
  };

  breakpoints.onBreak = function (reason) {
    yasp.Debugger.breakpointHit = (reason === "breakpoint");
  };

  breakpoints.onState = function (state) {
    if(yasp.Debugger.breakpointHit) {
      var pc = state.registers.special.pc;
      breakpoints.currentHit = pc;
      breakpoints.table.find('tr[data-offset=' + pc + ']').addClass('hit');
    }
  };

  breakpoints.offsetBreakpointsChanged = function (lines) {
    breakpoints.offsetBreakpoints = [];

    breakpoints.list.clear();

    for (var i = 0; i < lines.length; i++) {
      if(lines[i] === true) {
        var brk = {
          offset: yasp.Editor.map[i + 1],
          condition: null
        };

        breakpoints.list.add(brk);
        breakpoints.offsetBreakpoints.push(brk);
      }
    }

    breakpoints.list.checkForEmpty();
    breakpoints.sendBreakpoints();
  };

  breakpoints.list = {};

  breakpoints.list.checkForEmpty = function () {
    if(breakpoints.offsetBreakpoints.length === 0 && breakpoints.table.find('.isEmpty').length === 0) {
      var $tr = yasp.tabletools.addRow(breakpoints.table, [ {} ]);
      var $td = $tr.find('td');

      $tr.addClass('isEmpty');

      $td.css('text-align', 'center');
      $td.attr('colspan', 3);
      $td.attr('data-l10n', 'debugger.tabs.breakpoints.nobreakpoints');
      $td.attr('data-l10n-html', 'true');

      yasp.l10n.translateSingleDomElement($td);
    }
  };

  breakpoints.list.clear = function () {
    breakpoints.inactiveBreakpoints = [];
    yasp.tabletools.clear(breakpoints.table);
  };

  breakpoints.list.add = function (brk) {
    var line = yasp.Editor.reverseMap[brk.offset];

    var $td = yasp.tabletools.addRow(breakpoints.table, [
      { txt: line,                                 cls: "break-line" },
      { txt: "None",                               cls: "break-condition" },
      { cld: $('<input type="checkbox" checked>'), cls: "break-active" }
    ]);

    $td.attr('data-offset', brk.offset);

    if(breakpoints.currentHit === brk.offset) {
      $td.addClass('hit');
    }

    $td.find('.break-line').click(function () {
      yasp.Debugger.scrollLineIntoView(line);
    });

    $td.find('.break-active > input').change(function() {
      if(this.checked) {
        var inactive = breakpoints.inactiveBreakpoints;
        var newInactive = [];
        for (var i = 0; i < inactive.length; i++) {
          if(inactive[i] !== brk.offset)
            newInactive.push(inactive[i]);
        }
        breakpoints.inactiveBreakpoints = newInactive;
        $td.removeClass('inactive');
      } else {
        breakpoints.inactiveBreakpoints.push(brk.offset);
        $td.addClass('inactive');
      }

      breakpoints.sendBreakpoints();
    });
  };

  breakpoints.sendBreakpoints = function () {
    if(yasp.Debugger.EmulatorCommunicator) {
      var activeBreakpoints = [];

      for (var i = 0; i < breakpoints.offsetBreakpoints.length; i++) {
        var brk = breakpoints.offsetBreakpoints[i];

        if(breakpoints.inactiveBreakpoints.indexOf(brk.offset) === -1)
          activeBreakpoints.push(brk);
      }

      yasp.Debugger.EmulatorCommunicator.sendMessage("SET_BREAKPOINTS",
        {
          breakpoints: activeBreakpoints
        },
        function () { }
      );
    }
  };
})();