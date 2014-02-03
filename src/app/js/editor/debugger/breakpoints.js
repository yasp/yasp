if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var breakpoints = {};
  yasp.Debugger.breakpoints = breakpoints;

  breakpoints.breakpoints = [];

  breakpoints.onInit = function () {
  };

  breakpoints.onOpen = function () {
    yasp.Debugger.breakpoints.sendBreakpoints();
    yasp.Debugger.breakpointHit = false;
  };

  breakpoints.onBreak = function (reason) {
    yasp.Debugger.breakpointHit = (reason === "breakpoint");
  };

  breakpoints.breakpointsChanged = function (lines) {
    yasp.Debugger.breakpoints.breakpoints = [];

    for (var i = 0; i < lines.length; i++) {
      if(lines[i] === true) {
        yasp.Debugger.breakpoints.breakpoints.push({
          offset: yasp.Editor.map[i + 1],
          condition: null
        });
      }
    }

    yasp.Debugger.breakpoints.sendBreakpoints();
  };

  breakpoints.sendBreakpoints = function () {
    if(yasp.Debugger.EmulatorCommunicator) {
      yasp.Debugger.EmulatorCommunicator.sendMessage("SET_BREAKPOINTS",
        {
          breakpoints: yasp.Debugger.breakpoints.breakpoints
        },
        function () {
        }
      )
    }
  };
})();