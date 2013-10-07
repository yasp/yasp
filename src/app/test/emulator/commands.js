(function () {
  var emulator;

  module("emulator commands", {
    setup: function () {
      emulator = new yasp.Emulator();
      emulator.stepping = true;
    },
    teardown: function () {
      emulator = null;
    }
  });

  var commandTests = [
    {
      title: "MOV b0,1",
      bitcode: new Uint8Array([0x00, 0x00, 0x01]),
      ram: new Uint8Array([0x00, 0x00, 0x01]),
      steps: [ { ram: { 0: 1 } } ]
    },
    {
      title: "MOV b1,b0",
      bitcode: new Uint8Array([0x10, 0x00, 0x20]),
      ram: new Uint8Array([0x01, 0x00]),
      steps: [ { ram: { 1: 1 } } ]
    },
    {
      title: "MOV w0,0xFFAA",
      bitcode: new Uint8Array([0x20, 0x00, 0xff, 0xaa]),
      steps: [ { ram: { 0: 0xFF, 1: 0xAA } } ]
    },
    {
      title: "MOV w1,w0",
      bitcode: new Uint8Array([0x10, 0x40, 0x20]),
      ram: new Uint8Array([0xBB, 0xAA, 0x00, 0x00]),
      steps: [ { ram: { 2: 0xBB, 3: 0xAA } } ]
    },
    {
      title: "ADD b0,b1",
      bitcode: new Uint8Array([0x10, 0x04, 0x01]),
      ram: new Uint8Array([0x01, 0x01]),
      steps: [ { ram: { 0: 0x02 }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD b0,b1 - carry",
      bitcode: new Uint8Array([0x10, 0x04, 0x01]),
      ram: new Uint8Array([0xFF, 0x02]),
      steps: [ { ram: { 0: 0x01 }, flags: { c: true, z: false } } ]
    },
    {
      title: "ADD b0,b1 - carry & zero",
      bitcode: new Uint8Array([0x10, 0x04, 0x01]),
      ram: new Uint8Array([0xFF, 0x01]),
      steps: [ { ram: { 0: 0x00 }, flags: { c: true, z: true } } ]
    },
  ];

  QUnit.cases(commandTests).test("command", function (params) {
    emulator.pc = 0;
    emulator.load(params.bitcode, 0);

    if(params.ram) {
      emulator.ram = params.ram;
    }

    for (var i = 0; i < params.steps.length; i++) {
      var step = params.steps[i];

      emulator.tick();

      if(step.ram) {
        var addrs = Object.keys(step.ram);

        for (var j = 0; j < addrs.length; j++) {
          var addr = addrs[j];
          var expected = step.ram[addr];
          var actual = emulator.ram[addr];
          strictEqual(actual, expected)
        }
      }
      if(step.flags) {
        var flags = emulator.readFlags();
        for (var flag in flags) {
          if(typeof step.flags[flag] === undefined && flags[flag] === false ||
             typeof step.flags[flag] !== undefined && flags[flag] == step.flags[flag])
            ok(true, flag + " flag is " + flags[flag]);
          else
            ok(false, flag + " flag is " + flags[flag]);
        }
      }
    }
  });

})();
