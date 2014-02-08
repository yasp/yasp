if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var status = {};
  yasp.Debugger.status = status;

  status.onInit = function () {
    status.elemWrapper = $('#debugger_statusWrapper');
    status.elemStatus = $('#debugger_status');
    status.elemReason = $('#debugger_status_reason');
  };

  status.onBreak = function (reason) {
    status.updateStatus("break", reason);
  };

  status.onContinue = function () {
    status.updateStatus("run", null);
  };

  /** Updates the emulators status in the UI
   * @param stat {String} "break" or "run"
   * @param reason {?String} reason for "break"-status
   */
  status.updateStatus = function (stat, reason) {
    var color = "";

    if(stat === "break") {
      var subText = "debugger.status.break." + reason;

      if(["divide_by_zero", "invalid_instr"].indexOf(reason) !== -1)
        color = "Bad";
      else
        color = "NotSoGood";

      status.elemReason.attr('data-l10n', subText);
      yasp.l10n.translateSingleDomElement(status.elemReason);
    } else {
      color = "Good";
      status.elemReason.text("");
    }

    status.elemStatus.attr('data-l10n', "debugger.status." + stat);

    status.elemWrapper.removeClass('statusGood');
    status.elemWrapper.removeClass('statusNotSoGood');
    status.elemWrapper.removeClass('statusBad');

    status.elemWrapper.addClass('status' + color);

    yasp.l10n.translateSingleDomElement(status.elemStatus);
  };

})();