(function () {
  var tester = new yasp.test.EmulatorTester("Interrupts");

  var commandTestData = [];

  // RETI
  commandTestData = commandTestData.concat([
    {
      cmd: "RETI",
      setup: { reg: { "sp": 1 }, stack: [ 0x42, 0x41 ] },
      steps: [
        { reg: { "pc": 0x4142 } }
      ]
    }
  ]);

  // ENABLE
  commandTestData = commandTestData.concat([
    {
      cmd: "ENABLE 42",
      setup: { },
      steps: [
        { interruptMask: [ false, true, false, true, false, true, false, false ] }
      ]
    }
  ]);

  // DISABLE
  commandTestData = commandTestData.concat([
    {
      cmd: "DISABLE",
      setup: { interruptMask: [ true, true, true, true, true, true, true, true ] },
      steps: [
        { interruptMask: [ false, false, false, false, false, false, false, false ] }
      ]
    }
  ]);

  // Interrupt-Test
  commandTestData = commandTestData.concat([
    {
      title: "Interrupt",
      cmd: "MOV b0,1",
      setup: {
        interruptMask: [ false, true, false, false, false, false, false, false ],
        rom: { 0x102: 0x00, 0x103: 66 }
      },
      steps: [
        { "triggerInterrupt": 1 },
        { "reg": { "pc": 69 } } // not 66 because there is 0x00 0x00 0x00 at that address which is MOV b0,0
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();