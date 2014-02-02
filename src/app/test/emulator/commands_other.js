(function () {
  var tester = new yasp.test.EmulatorTester("Other");

  var commandTestData = [];

  // WRITERAM
  commandTestData = commandTestData.concat([
    {
      cmd: "WRITERAM w0,b2",
      setup: { reg: { "w0": 0xFF, "b2": 0xFA } },
      steps: [
        { ram: { 0xFF: 0xFA } }
      ]
    },
    {
      cmd: "WRITERAM w0,b2",
      setup: { ram: new Uint8Array(160), reg: { "w0": 0xFFFF, "b2": 0xFA } },
      steps: [
        { flags: { "c": true, "z": false } }
      ]
    }
  ]);

  // READRAM
  commandTestData = commandTestData.concat([
    {
      cmd: "READRAM b2,w0",
      setup: { reg: { "w0": 0x03, "b3": 0xFA } },
      steps: [
        { reg: { "b2": 0xFA } }
      ]
    }
  ]);

  // LA
  commandTestData = commandTestData.concat([
    {
      cmd: "MOV b0,0\nlbl: LA w0,lbl",
      setup: {},
      steps: [
        { }, // MOV
        { reg: { "w0": 0x0003 } }
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();