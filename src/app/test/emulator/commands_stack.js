(function () {
  var tester = new yasp.test.EmulatorTester("Stack");

  var commandTestData = [];

  // PUSH
  commandTestData = commandTestData.concat([
    {
      cmd: "PUSH b0",
      setup: { reg: { "b0": 0xFA } },
      steps: { reg: { "sp": 0 }, stack: { 0: 0xFA } }
    },
    {
      cmd: "PUSH w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: { reg: { "sp": 1 }, stack: { 0: 0xFB, 1: 0xFA } }
    }
  ]);

  // POP
  commandTestData = commandTestData.concat([
    {
      cmd: "POP b0",
      setup: { reg: { "sp": 0 }, stack: [0xFA] },
      steps: { reg: { "b0": 0xFA } }
    },
    {
      cmd: "POP w0",
      setup: { reg: { "sp": 1 }, stack: [0xFB, 0xFA] },
      steps: { reg: { "w0": 0xFAFB } }
    }
  ]);

  // Stack
  commandTestData = commandTestData.concat([
    {
      cmd: "PUSH b0\nPOP b1",
      setup: { reg: { "b0": 0xFA } },
      steps: [
        {},
        { reg: { "b1": 0xFA } }
      ]
    },
    {
      cmd: "PUSH w0\nPOP w1",
      setup: { reg: { "w0": 0xFAFB } },
      steps: [
        {},
        { reg: { "w1": 0xFAFB } }
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();