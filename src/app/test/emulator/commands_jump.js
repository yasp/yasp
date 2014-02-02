(function () {
  var tester = new yasp.test.EmulatorTester("Jump");

  var commandTestData = [];

  // JMP
  commandTestData = commandTestData.concat([
    {
      cmd: "JMP lbl\nDB 0xFF\nlbl:",
      setup: { },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JZ
  commandTestData = commandTestData.concat([
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    },
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JNZ
  commandTestData = commandTestData.concat([
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ]);

  // JC
  commandTestData = commandTestData.concat([
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    },
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JNC
  commandTestData = commandTestData.concat([
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ]);

  // CALL/RET
  commandTestData = commandTestData.concat([
    {
      title: "CALL/RET",
      cmd: "CALL lbl\n"
        + "DB 255\n"
        + "lbl:"
        + "RET",
      setup: { },
      steps: [
        { reg: { "pc": 3, "sp": 1 }, stack: [ 0x02, 0x00 ]  },
        { reg: { "pc": 2, "sp": -1 } }
      ]
    }
  ]);

  // JMPI
  commandTestData = commandTestData.concat([
    {
      cmd: "JMPI w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: [
        { reg: { "pc": 0xFAFB } }
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();