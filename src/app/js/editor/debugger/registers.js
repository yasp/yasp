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
    registers.usedRegisters = [];
  };

  registers.onOpen = function () {
    registers.heading.empty();
    registers.snapshots.empty();

    registers.heading.append('<div class="flag">C</div>');
    registers.heading.append('<div class="flag">Z</div>');
    registers.heading.append('<div class="pointer">PC</div>');
    registers.heading.append('<div class="pointer">SP</div>');

    registers.usedRegisters = [];

    for (var reg in yasp.Editor.symbols.usedRegisters) {
      registers.usedRegisters.push(reg);
    }

    var additionalRegs = [];

    for (var i = 0; i < registers.usedRegisters.length; i++) {
      var reg = registers.usedRegisters[i];
      var type = reg[0];
      var num = +reg.substr(1);

      if(type === "B") {
        var newNum = ~~(num / 2);
        additionalRegs.push("W" + newNum);
      } else if(type == "W") {
        var newNum = ~~(num * 2);
        additionalRegs.push("B" + newNum);
        additionalRegs.push("B" + (newNum + 1));
      }
    }

    for (var i = 0; i < additionalRegs.length; i++) {
      var reg = additionalRegs[i];

      if(registers.usedRegisters.indexOf(reg) === -1) {
        registers.usedRegisters.push(reg);
      }
    }

    registers.usedRegisters.sort(function (a, b) {
      var atype = a[0];
      var anum = +a.substr(1);

      var btype = b[0];
      var bnum = +b.substr(1);

      if(atype != btype) {
        return atype === 'B' ? -1 : 1;
      } else {
        return anum - bnum;
      }
    });

    for (var i = 0; i < registers.usedRegisters.length; i++) {
      var reg = registers.usedRegisters[i];
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

    for (var i = 0; i < registers.usedRegisters.length; i++) {
      var reg = registers.usedRegisters[i];
      snap[reg] = state.registers.general[reg[0].toLowerCase()][reg.substr(1)];
    }

    registers.addSnapshot(snap);
    registers.setStack(state.stack);
  };

})();