(function () {
  var emulator;
  var assembler = new yasp.Assembler();

  module("emulator commands", {
    setup: function () {
      emulator = new yasp.Emulator();
      emulator.stepping = true;
      assembler = new yasp.Assembler();
    },
    teardown: function () {
      emulator = null;
      assembler = null;
    }
  });

  /*
    Test-Format:
      {
        cmd: "MOV b0,b1",
        setup: { reg: { "b2": 1 } },
        steps: [
          { reg: { "w0": 1, "b1": "00000001" } },
          { ram: { 0x42: 1 }, pin: { .. to be defined .. } },
          { rom: { 0x00: 0 }, flag: { c: false, z: true } }
        ]
      }

    Minimal example:
      {
        cmd: "MOV b0,b2",
        setup: { reg: { "b2": 1 } },
        steps: { reg: { "b0": 1 } }
      }
  */

  var commandTestData = [];

  // MOV
  commandTestData = commandTestData.concat([
    {
      cmd: "MOV b0,1",
      steps: { reg: { "b0": 1 } }
    },
    {
      cmd: "MOV b0,b1",
      setup: { reg: { "b1": 1 } },
      steps: { reg: { "b0": 1 } }
    },
    {
      cmd: "MOV w0,0xFFAA",
      steps: { reg: { "w0": 0xFFAA } }
    },
    {
      cmd: "MOV w0,w1",
      setup: { reg: { "w1": 0xFFAA } },
      steps: { reg: { "w0": 0xFFAA } }
    }
  ]);

  // ADD b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 255, "b1": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 0xFF, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,2",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0x02FA } },
      steps: { reg: { "w0": 0x02FB }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,2",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0x0A10, "w1": 0x01FF } },
      steps: { reg: { "w0": 0x0C0F }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0002 } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // SUB b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 2, "b1": 1 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 2 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,2",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,0x0F01",
      setup: { reg: { "w0": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0xFF00, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0F01, "w1": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ]);

  // RR
  commandTestData = commandTestData.concat([
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000001" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "00011111 11111000" } },
      steps: { reg: { "w0": "00001111 11111100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "11111111 10101011" } },
      steps: { reg: { "w0": "01111111 11010101" }, flags: { c: true, z: false } }
    }
  ]);

  // RL
  commandTestData = commandTestData.concat([
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "10000000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "01111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "11111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: true, z: false } }
    }
  ]);

  // CLR-Commands
  commandTestData = commandTestData.concat([
    {
      cmd: "CLR b0",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    },
    {
      cmd: "CLR w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // INV-Commands
  commandTestData = commandTestData.concat([
    {
      cmd: "INV b0",
      setup: { reg: { "b0": "00000001" } },
      steps: { reg: { "b0": "11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV b0",
      setup: { reg: { "b0": "11111111" } },
      steps: { reg: { "b0": "00000000" }, flags: { c:false, z: true } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "00000000 00000001" } },
      steps: { reg: { "w0": "11111111 11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "11111111 11111111" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c:false, z: true } }
    }
  ]);

  for (var i = 0; i < commandTestData.length; i++) {
    var test = commandTestData[i];

    test.title = test.cmd;
    test.asm = assembler.assemble({ code: test.cmd, jobs: ["bitcode"] });
  }

  QUnit.cases(commandTestData).test("command", function (params) {
    if(params.asm.success === false)
      return ok(false, "Assembler failed");

    emulator.pc = 0;
    emulator.load(params.asm.bitcode, 0);

    var setup = params.setup;

    if(setup) {
      if(setup.reg) {
        for (var r in setup.reg) {
          var val = parseRegValue(setup.reg[r]);

          if(r.length < 2)
          {
            ok(false, "Invalid test: setup-register " + r);
            continue;
          }

          var n = +r.substr(1);

          if(r.charAt(0) === "b")
            emulator.writeByteRegister(n, val);
          else if (r.charAt(0) === "w")
            emulator.writeWordRegister(n, val);
          else
            ok(false, "Invalid test: setup-register " + r + " does not exist.");
        }
      }
    }

    params.steps = params.steps || [];

    if(!(params.steps instanceof Array))
      params.steps = [params.steps];

    for (var i = 0; i < params.steps.length; i++) {
      var step = params.steps[i];

      emulator.tick();

      if(step.reg) {
        for (var r in step.reg) {
          var actual;
          var expected = parseRegValue(step.reg[r]);

          if(r.length < 2)
          {
            ok(false, "Invalid test: step-register " + r);
            continue;
          }

          var n = +r.substr(1);

          if(r.charAt(0) === "b")
            actual = emulator.readByteRegister(n);
          else if (r.charAt(0) === "w")
            actual = emulator.readWordRegister(n);
          else
          {
            ok(false, "Invalid test: step-register " + r + " does not exist.");
            continue;
          }

          strictEqual(actual, expected, "register " + r + " is " + expected);
        }
      }
      if(step.flags) {
        var flags = emulator.readFlags();

        for (var flag in flags) {
          var longname = "unknown";
          if(flag == "c")
            longname = "carry";
          if(flag == "z")
            longname = "zero";
          var msg = longname + " flag is " + (step.flags[flag] === true ? "set" : "not set");

          if(typeof step.flags[flag] === undefined && flags[flag] === false ||
             typeof step.flags[flag] !== undefined && flags[flag] == step.flags[flag])
            ok(true, msg);
          else
            ok(false, msg);
        }
      }
      if(step.ram) {
        alert("Step-RAM-Checking is not yet implemented")
      }
      if(step.rom) {
        alert("Step-ROM-Checking is not yet implemented")
      }
      if(step.pin) {
        alert("Step-PIN-Checking is not yet implemented")
      }
    }

    function parseRegValue (val) {
      if(typeof val === "string")
        return parseInt(val.replace(' ', ''), 2);
      return val;
    }
  });

})();
