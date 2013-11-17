(function () {
  var assembler = new yasp.Assembler();

  yasp.Repl = function () {
    this.emulator = new yasp.Emulator(true);
  };

  yasp.Repl.prototype.execute = function (code) {
    var asmResult = this.assemble(code);

    if(asmResult.error != null)
      return asmResult;

    this.emulator.load(asmResult.bitcode, 0);
    this.emulator.pc = 0;
    try {
      this.emulator.tick();
    } catch (err) {
      return {
        error: err,
        bitcode: asmResult.bitcode
      };
    }

    return {
      error: null,
      bitcode: asmResult.bitcode
    };
  };

  yasp.Repl.prototype.assemble = function (code) {
    var asm = assembler.assemble({ code: code, jobs: ["bitcode"] });

    if(asm.success === false)
    {
      return {
        error: {
          step: "asm",
          errors: asm.errors
        }
      }
    }
    else
    {
      return {
        error: null,
        bitcode: asm.bitcode
      }
    }
  };

  yasp.Repl.prototype.benchmark = function (code, times) {
    var asmResult = this.assemble(code);
    var ttimes = times;

    if(asmResult.error != null)
      return asmResult;

    this.emulator.load(asmResult.bitcode, 0);

    var start = window.performance.now();

    while(ttimes--) {
      this.emulator.pc = 0;
      this.emulator.tick();
    }

    var end = window.performance.now();
    var taken = end - start;

    return {
      error: null,
      ms: taken,
      hz: (1 / (taken / times))
    };
  };

  yasp.Repl.prototype.getRamDump = function () {
    return yasp.Repl.getDumpFromArray (this.emulator.ram, 20);
  };

  yasp.Repl.prototype.getRegisterDump = function () {
    var regs = "";

    var getSingleDump = function (type, num) {
      var val = (type == "w" ? this.emulator.readWordRegister(num) : this.emulator.readByteRegister(num));
      var vv = val.toString(16).toUpperCase();
      vv = pad(vv, type == "w" ? 4 : 2);
      vv = "0x" + vv;
      return (num < 10 ? " " : "") + type + num + " = " + vv;

      function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      }
    }.bind(this);

    regs += "Flags: z=" + this.emulator.flags.z + "\n";
    regs += "       c=" + this.emulator.flags.c;
    regs += "\n\nRegisters:\n\n";

    for (var i = 0; i < 32; i++) {

      if(i < 16) {
        regs += getSingleDump("b", i * 2);
        regs += "\n";
        regs += getSingleDump("b", i * 2 + 1) + "  " + getSingleDump("w", i);
        regs += "\n";
      } else {
        regs += getSingleDump("w", i);
      }

      regs += "\n";
    }

    return regs;
  };

  yasp.Repl.prototype.getPinDump = function () {
    var pins = "";

    for (var p in this.emulator.pins) {
      var pin = this.emulator.pins[p];
      pins += (p < 10 ? " " : "") + "P" + p;
      pins += "  state = " + pin.state + "\n";
      pins += "     type  = " + pin.type + "\n";
      pins += "     mode  = " + pin.mode + "\n";
      pins += "\n";
    }

    return pins;
  };

  yasp.Repl.prototype.getRomDump = function () {
    return yasp.Repl.getDumpFromArray (this.emulator.rom, 20);
  };

  yasp.Repl.getDumpFromArray = function (data, b) {
    var dmp = "";
    for (var i = 0; i < data.length; i++) {
      if(b != -1 && i % 20 == 0)
        dmp += "\n";
      var d = data[i].toString(16);
      if(d.length == 1)
        d = "0" + d;
      dmp += "0x" + d + " ";
    }
    return dmp;
  }

})();