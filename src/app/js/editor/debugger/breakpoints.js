if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var breakpoints = {};
  yasp.Debugger.breakpoints = breakpoints;

  breakpoints.offsetBreakpoints = [];

  breakpoints.onInit = function () {
  };

  breakpoints.onOpen = function () {
    breakpoints.sendBreakpoints();
    yasp.Debugger.breakpointHit = false;
  };

  breakpoints.onBreak = function (reason) {
    yasp.Debugger.breakpointHit = (reason === "breakpoint");
  };

  breakpoints.offsetBreakpointsChanged = function (lines) {
    breakpoints.offsetBreakpoints = [];

    for (var i = 0; i < lines.length; i++) {
      if(lines[i] === true) {
        yasp.Debugger.offsetBreakpoints.offsetBreakpoints.push({
          offset: yasp.Editor.map[i + 1],
          condition: null
        });
      }
    }

    breakpoints.sendBreakpoints();
  };

  breakpoints.sendBreakpoints = function () {
    if(yasp.Debugger.EmulatorCommunicator) {
      var breakpoints = [];

      breakpoints = breakpoints.concat(yasp.Debugger.breakpoints.offsetBreakpoints);

      yasp.Debugger.EmulatorCommunicator.sendMessage("SET_BREAKPOINTS", { breakpoints: breakpoints }, function () { });
    }
  };
})();