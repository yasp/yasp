(function () {
  var tester = new yasp.test.EmulatorTester("IO");

  var commandTestData = [];

  // HIGH
  commandTestData = commandTestData.concat([
    {
      cmd: "HIGH 3",
      setup: { pin: { 3: false } },
      steps: [
        { pin: { 3: 1 } }
      ]
    }
  ]);

  // LOW
  commandTestData = commandTestData.concat([
    {
      cmd: "LOW 3",
      setup: { pin: { 3: true } },
      steps: [
        { pin: { 3: 0 } }
      ]
    }
  ]);

  // TOGGLE
  commandTestData = commandTestData.concat([
    {
      cmd: "TOGGLE 3",
      setup: { pin: { 3: 1 } },
      steps: [
        { pin: { 3: 0 } }
      ]
    }
  ]);

  // PIN
  commandTestData = commandTestData.concat([
    {
      cmd: "PIN 3",
      setup: { pin: { 3: 1 } },
      steps: [
        { flags: { z: false, c: false } }
      ]
    },
    {
      cmd: "PIN 3",
      setup: { pin: { 3: 0 } },
      steps: [
        { flags: { z: true, c: false } }
      ]
    }
  ]);

  // POT
  commandTestData = commandTestData.concat([
    {
      cmd: "POT 10,w0",
      setup: { pin: { 10: 0xFF } },
      steps: [
        { reg: { "w0": 0x00FF } }
      ]
    }
  ]);

  // ADC0/1/2
  commandTestData = commandTestData.concat([
    {
      cmd: "ADC0 w1",
      setup: { pin: { 10: 0xFA } },
      steps: [
        { reg: { "w1": 0x00FA } }
      ]
    },
    {
      cmd: "ADC1 w1",
      setup: { pin: { 11: 0xFA } },
      steps: [
        { reg: { "w1": 0x00FA } }
      ]
    },
    {
      cmd: "ADC2 w1",
      setup: { pin: { 12: 0xFA } },
      steps: [
        { reg: { "w1": 0x00FA } }
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();