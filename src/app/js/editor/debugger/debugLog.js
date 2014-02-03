if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var debugLog = {};
  yasp.Debugger.debugLog = debugLog;

  debugLog.onInit = function () {
    debugLog.element = $('#debugger-tabs-debug > pre:first');
    debugLog.formatSpan = $('#debugger-tabs-debug .logFormat');

    $('.debugger-tabs-debug-clear').click(debugLog.clearLog);

    $('.logFormat').click(function () {
      var next = yasp.Debugger.cycleNumberFormat(debugLog.formatSpan, debugLog.numberFormat);
      debugLog.numberFormat = next;
    });

    debugLog.formatSpan.text('HEX');
    debugLog.numberFormat = 'hex';
  };

  debugLog.onOpen = function () {
    debugLog.clearLog();
  };

  debugLog.clearLog = function () {
    debugLog.element.text("");
  };

  debugLog.onState = function () {
  };

  debugLog.onDebug = function (msgs) {
    var strs = [];

    for (var i = 0; i < msgs.length; i++) {
      var msg = msgs[i];

      if(msg.type === "register") {
        var val = "";
        var format = yasp.Debugger.formatNameToRadix(debugLog.numberFormat);
        var padding = yasp.Debugger.formatPadding[debugLog.numberFormat];

        if(msg.subtype === "b")
          val = yasp.Debugger.formatNumber(msg.val, padding, format);
        else if(msg.subtype === "w")
          val = yasp.Debugger.formatNumber(msg.val, padding * 2, format);

        if(format === 16)
          val = "0x" + val;

        strs.push(msg.subtype + msg.addr + ": " + val);
      } else if(msg.type === "string") {
        strs.push(msg.val);
      }
    }

    var str = debugLog.element.text() + "\n" + strs.join("\n");

    if(str.length > 1024) {
      str = str.substring(str.length - 1024);
    }

    debugLog.element.text(str);
    debugLog.element.scrollTop(yasp.Debugger.debugLog.element[0].scrollHeight);
  }
})();
