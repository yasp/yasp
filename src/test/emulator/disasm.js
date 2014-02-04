(function () {
  var emulator;

  module("disasm", {
    setup: function () {
    },
    teardown: function () {
    }
  });

  var getCommandData = [
    {
      rom: [ 0xFF, 0x00, 0x00, 0x00, 0x00 ],
      offset: 1,
      cmd: {
        cmd: null,
        neededBytes: 3,
        str: "MOV b0, 0",
        params: [
          {
            type: "r_byte",
            value: null,
            address: 0,
            isRByte: true,
            valueNeeded: false
          },
          {
            type: "l_byte",
            value: 0,
            address: null,
            valueNeeded: false
          }
        ]
      }
    }
  ];

  QUnit.cases(getCommandData).test("getCommand", function (params) {
    var cmd = yasp.disasm.getCommand(params.rom, params.offset);
    cmd.cmd = null;
    deepEqual(cmd, params.cmd);
  });
})();
