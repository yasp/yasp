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
    {
      title: "ADD b0,1",
      bitcode: new Uint8Array([0x00, 0x20, 0x01]),
      ram: new Uint8Array([0x01]),
      steps: [ { ram: { 0: 0x02 }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD b0,2 - carry",
      bitcode: new Uint8Array([0x00, 0x20, 0x02]),
      ram: new Uint8Array([0xFF]),
      steps: [ { ram: { 0: 0x01 }, flags: { c: true, z: false } } ]
    },
    {
      title: "ADD b0,1 - carry & zero",
      bitcode: new Uint8Array([0x00, 0x20, 0x01]),
      ram: new Uint8Array([0xFF]),
      steps: [ { ram: { 0: 0x00 }, flags: { c: true, z: true } } ]
    },
    {
      title: "ADD w0,1",
      bitcode: new Uint8Array([0x20, 0x20, 0x01, 0x10]),
      ram: new Uint8Array([0x02, 0xFA]),
      steps: [ { ram: { 0: 0x04, 1: 0x0A }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD w0,1 - 2nd byte",
      bitcode: new Uint8Array([0x20, 0x20, 0x00, 0x01]),
      ram: new Uint8Array([0x00, 0x00]),
      steps: [ { ram: { 1: 0x01 }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD w0,1 - 1st byte",
      bitcode: new Uint8Array([0x20, 0x20, 0x01, 0x00]),
      ram: new Uint8Array([0x00, 0x00]),
      steps: [ { ram: { 0: 0x01 }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD w0,2 - carry",
      bitcode: new Uint8Array([0x20, 0x20, 0x00, 0x02]),
      ram: new Uint8Array([0xFF, 0xFF]),
      steps: [ { ram: { 0: 0x00, 1: 0x01 }, flags: { c: true, z: false } } ]
    },
    {
      title: "ADD w0,1 - carry & zero",
      bitcode: new Uint8Array([0x20, 0x20, 0x00, 0x01]),
      ram: new Uint8Array([0xFF, 0xFF]),
      steps: [ { ram: { 0: 0x00, 1: 0x00 }, flags: { c: true, z: true } } ]
    },
    {
      title: "ADD w0,w1 - 2nd byte",
      bitcode: new Uint8Array([0x10, 0x44, 0x01]),
      ram: new Uint8Array([0x00, 0x01, 0x00, 0x01]),
      steps: [ { ram: { 1: 0x02 }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD w0,w1 - 1st byte",
      bitcode: new Uint8Array([0x10, 0x44, 0x01]),
      ram: new Uint8Array([0x01, 0x00, 0x01, 0x00]),
      steps: [ { ram: { 0: 0x02 }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD w0,w1",
      bitcode: new Uint8Array([0x10, 0x44, 0x01]),
      ram: new Uint8Array([0x0A, 0x10, 0x01, 0xFF]),
      steps: [ { ram: { 0: 0x0C, 1: 0x0F }, flags: { c: false, z: false } } ]
    },
    {
      title: "ADD w0,w1 - carry",
      bitcode: new Uint8Array([0x10, 0x44, 0x01]),
      ram: new Uint8Array([0xFF, 0xFF, 0x00, 0x02]),
      steps: [ { ram: { 0: 0x00, 1: 0x01 }, flags: { c: true, z: false } } ]
    },
    {
      title: "ADD w0,w1 - carry & zero",
      bitcode: new Uint8Array([0x10, 0x44, 0x01]),
      ram: new Uint8Array([0xFF, 0xFF, 0x00, 0x01]),
      steps: [ { ram: { 0: 0x00, 1: 0x00 }, flags: { c: true, z: true } } ]
    },
    {
      title: "RR b0 ; b0 = 64 - zero not set",
      bitcode: new Uint8Array([0x40, 0x80]),
      ram: new Uint8Array([0x40]),
      steps: [ { ram: { 0: 0x20 }, flags: { c: false, z: false } } ]
    },
    {
      title: "RR b0 ; b0 = 66 - zero not set",
      bitcode: new Uint8Array([0x40, 0x80]),
      ram: new Uint8Array([0x42]),
      steps: [ { ram: { 0: 0x21 }, flags: { c: false, z: false } } ]
    },
    {
      title: "RR w0 ; w0 = 0xFFAA - zero not set",
      bitcode: new Uint8Array([0x60, 0x80]),
      ram: new Uint8Array([0xFF, 0xAA]),
      steps: [ { ram: { 0: 0x7F, 1: 0xD5 }, flags: { c: false, z: false } } ]
    },
    {
      title: "RR w0 ; b0 = 0x1FF8 - zero not set",
      bitcode: new Uint8Array([0x60, 0x80]),
      ram: new Uint8Array([0x1F, 0xF8]),
      steps: [ { ram: { 0: 0x0F, 1: 0xFC }, flags: { c: false, z: false } } ]
    },
    {
      title: "RL b0 ; b0 = 64 - zero not set",
      bitcode: new Uint8Array([0x40, 0xA0]),
      ram: new Uint8Array([0x40]),
      steps: [ { ram: { 0: 0x80 }, flags: { c: false, z: false } } ]
    },
    {
      title: "RL b0 ; b0 = 63 - zero not set",
      bitcode: new Uint8Array([0x40, 0xA0]),
      ram: new Uint8Array([0x3F]),
      steps: [ { ram: { 0: 0x7E }, flags: { c: false, z: false } } ]
    },
    {
      title: "RL w0 ; b0 = 0xFFAA - zero not set",
      bitcode: new Uint8Array([0x60, 0xA0]),
      ram: new Uint8Array([0xFF, 0xAA]),
      steps: [ { ram: { 0: 0xFF, 1: 0x54 }, flags: { c: true, z: false } } ]
    },
    {
      title: "RL w0 ; b0 = 0x7B10 - zero  not set",
      bitcode: new Uint8Array([0x60, 0xA0]),
      ram: new Uint8Array([0x7B, 0x10]),
      steps: [ { ram: { 0: 0xF6, 1: 0x20 }, flags: { c: false, z: false } } ]
    },
    {
      title: "INV b0 ; b0 = 1",
      bitcode: new Uint8Array([0x40, 0x40]),
      ram: new Uint8Array([0x01]),
      steps: [ { ram: { 0: 0xFE }, flags: { c:false, z: false } } ]
    },
    {
      title: "INV b0 ; b0 = 0xFF, zero set",
      bitcode: new Uint8Array([0x40, 0x40]),
      ram: new Uint8Array([0xFF]),
      steps: [ { ram: { 0: 0x00 }, flags: { c:false, z: true } } ]
    },
    {
      title: "INV w0 ; w0 = 1",
      bitcode: new Uint8Array([0x60, 0x40]),
      ram: new Uint8Array([0x00, 0x01]),
      steps: [ { ram: { 0: 0xFF, 1: 0xFE }, flags: { c:false, z: false } } ]
    },
    {
      title: "INV w0 ; b0 = 0xFFFF, zero set",
      bitcode: new Uint8Array([0x60, 0x40]),
      ram: new Uint8Array([0xFF, 0xFF]),
      steps: [ { ram: { 0: 0x00, 1: 0x00 }, flags: { c:false, z: true } } ]
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
          strictEqual(actual, expected, "byte " + addr + " is " + expected)
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
