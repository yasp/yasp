(function () {
  var tester = new yasp.test.EmulatorTester("Commands");
  var allCommands = yasp.commands;

  for (var i = 0; i < allCommands.length; i++) {
    var cmd = allCommands[i];

    if(cmd.tests) {
      yasp.commands = [cmd];
      tester.addTests(cmd.tests);
    }
  }

  yasp.commands = allCommands;

  tester.addTest({
    cmd: "PUSH b0\nPOP b1",
    setup: { reg: { "b0": 0xFA } },
    steps: [
      {},
      { reg: { "b1": 0xFA } }
    ]
  });

  tester.addTest({
    cmd: "PUSH w0\nPOP w1",
    setup: { reg: { "w0": 0xFAFB } },
    steps: [
      {},
      { reg: { "w1": 0xFAFB } }
    ]
  });

  tester.addTest({
    title: "Interrupt",
    cmd: "MOV b0,1",
    setup: {
      interruptMask: [ false, true, false, false, false, false, false, false ],
      rom: { 0x102: 0x00, 0x103: 66 }
    },
    steps: [
      { ss: { "triggerInterrupt": 1 } },
      { }, // jumping
      { "reg": { "pc": 69 } } // not 66 because there is 0x00 0x00 0x00 at that address which is MOV b0,0
    ]
  });

  tester.addTest({
    title: "CALL/RET",
    cmd: "CALL lbl\n"
      + "DB 255\n"
      + "lbl:"
      + "RET",
    setup: { },
    steps: [
      { reg: { "pc": 3, "sp": 2 }, stack: [ 0x02, 0x00 ]  },
      { reg: { "pc": 2, "sp": 0 } }
    ]
  });

  tester.done();
})();