(function () {
  // 1537
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
    this.emulator.tick();

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

    if(asmResult.error != null)
      return asmResult;

    this.emulator.load(asmResult.bitcode, 0);

    var start = +new Date();

    for (var i = 0; i < times; i++) {
      this.emulator.pc = 0;
      this.emulator.tick();
    }

    var end = +new Date();
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