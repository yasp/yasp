(function () {
  var tester = new yasp.test.EmulatorTester("Debug");

  var commandTestData = [];

  // ECHO
  commandTestData = commandTestData.concat([
    {
      cmd: "ECHO str\nstr: STRING \"foo\"",
      setup: {},
      steps: [
        { debug: { "addr": 5, "subtype": null, "type": "string", "val": "foo" } }
      ]
    }
  ]);

  // DEBUG
  commandTestData = commandTestData.concat([
    {
      cmd: "DEBUG w1",
      setup: { reg: { "w1": 0x0102 } },
      steps: [
        { debug: { "addr": 1, "subtype": "w", "type": "register", "val": 0x0102 } }
      ]
    },
    {
      cmd: "DEBUG b2",
      setup: { reg: { "b2": 0xFA } },
      steps: [
        { debug: { "addr": 2, "subtype": "b", "type": "register", "val": 0xFA } }
      ]
    }
  ]);

  // BREAK
  commandTestData = commandTestData.concat([
    {
      cmd: "BREAK",
      setup: {},
      steps: [
        { running: false }
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();