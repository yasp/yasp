if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var registers = {};
  yasp.Debugger.registers = registers;

  registers.onInit = function () {
    registers.heading = $('#debugger-tabs-registers > .registers > .heading');
    registers.format = $('#debugger-tabs-registers .registerFormat');
    registers.registers = $('#debugger-tabs-registers > .registers');
    registers.snapshots = $('#debugger-tabs-registers > .registers > .snapshots');
    registers.stack = $('#debugger-tabs-registers > .stack > pre');

    registers.format.text('HEX');
    registers.registers.addClass("format-hex");
    registers.currentFormat = 'hex';
  };

  registers.onOpen = function () {
    registers.heading.empty();
    registers.snapshots.empty();

    registers.heading.append('<div class="flag">C</div>');
    registers.heading.append('<div class="flag">Z</div>');
    registers.heading.append('<div class="pointer">PC</div>');
    registers.heading.append('<div class="pointer">SP</div>');

    for (var reg in yasp.Editor.symbols.usedRegisters) {
      registers.heading.append(
        $('<div class="register">' + reg.toLowerCase() + '</div>').addClass(reg[0] === "B" ? "byte" : "word")
      );
    }
  };

  registers.addSnapshot = function (regs) {
    var $snap = $('<div>');
    var i = 0;

    var lastSnap = $(registers.snapshots.children()[0]);
    $snap.append('<div class="number">' + registers.snapshots.children().length + '</div>');

    var format = registers.currentFormat;
    var formatNum = yasp.Debugger.formatNameToRadix(format);
    var padding = yasp.Debugger.formatPadding[registers.currentFormat];

    for (var reg in regs) {
      var $reg = $('<div>');

      if(reg === "C" || reg === "Z") {
        $reg.text(regs[reg] ? "1" : "0");
        $reg.addClass("flag");
      }

      if(reg === "PC" || reg === "SP") {
        $reg.text(yasp.Debugger.formatHexNumber(regs[reg], 4));
        $reg.addClass("pointer");
      }

      if(reg === "SP") {
        $reg.text(regs[reg]);
        $reg.addClass("pointer");
      }

      if(reg[0] === "B") {
        $reg.text(yasp.Debugger.formatNumber(regs[reg], padding, formatNum));
        $reg.addClass("register byte");
      }
      else if(reg[0] === "W") {
        $reg.text(yasp.Debugger.formatNumber(regs[reg], padding * 2, formatNum));
        $reg.addClass("register word");
      }

      if(lastSnap.length > 0 && $reg.text() != $(lastSnap.children()[i + 1]).text())
        $reg.addClass("changed");

      $snap.append($reg);
      i++;
    }

    registers.snapshots.prepend($snap);
  };

  registers.setStack = function (stack) {
    var str = "";

    for (var i = 0; i < stack.length; i++) {
      str += (i === stack.length - 1) ? "> " : "  ";
      str += yasp.Debugger.formatHexNumber(stack[i], 2) + "\n";
    }

    registers.stack.text(str);
    registers.stack.scrollTop(registers.stack[0].scrollHeight);
  };


  $('.registerFormat').click(function () {
    var oldRadix = yasp.Debugger.formatNameToRadix(registers.currentFormat);
    var next = yasp.Debugger.cycleNumberFormat(registers.format, registers.currentFormat);

    var newRadix = yasp.Debugger.formatNameToRadix(next);
    var newPadding = yasp.Debugger.formatPadding[next];
    var allRegs = registers.snapshots.find('.register');

    for (var i = 0; i < allRegs.length; i++) {
      var $reg = $(allRegs[i]);
      var num = parseInt($reg.text(), oldRadix);

      $reg.text(yasp.Debugger.formatNumber(num, newPadding * ($reg.hasClass('word') ? 2 : 1), newRadix));
    }

    registers.registers.removeClass("format-hex");
    registers.registers.removeClass("format-bin");
    registers.registers.removeClass("format-dec");
    registers.registers.addClass("format-" + next);

    registers.currentFormat = next;
  });

  registers.onState = function (state) {
    var snap = {};

    snap["C"] = state.registers.flags["C"];
    snap["Z"] = state.registers.flags["Z"];

    snap["PC"] = state.registers.special["pc"];
    snap["SP"] = state.registers.special["sp"];

    for (var reg in yasp.Editor.symbols.usedRegisters) {
      snap[reg] = state.registers.general[reg[0].toLowerCase()][reg.substr(1)];
    }

    registers.addSnapshot(snap);
    registers.setStack(state.stack);
  };

})();