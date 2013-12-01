(function () {
  var cases = [
    {
      title: "bitcode missing",
      action: "LOAD",
      payload: { start: 0 },
      expectedPayload: {},
      expectedError: { code: 2 }
    },
    {
      title: "bitcode invalid",
      action: "LOAD",
      payload: { start: 0, bitcode: [] },
      expectedPayload: {},
      expectedError: { code: 2 }
    },
    {
      title: "start invalid",
      action: "LOAD",
      payload: { start: -1, bitcode: new Uint8Array() },
      expectedPayload: {},
      expectedError: { code: 0 }
    },
    {
      title: "bitcode too big",
      action: "LOAD",
      payload: { start: 0, bitcode: new Uint8Array(500000) },
      expectedPayload: {},
      expectedError: { code: 1 }
    },
    {
      title: "bitcode okay",
      action: "LOAD",
      payload: { start: 0, bitcode: new Uint8Array() },
      expectedPayload: {},
      expectedError: null
    },
    {
      title: "",
      action: "BREAK",
      payload: {},
      expectedPayload: {},
      expectedError: null
    }
  ];

  yasp.communicatorTester(cases, "../js/emulator/emulator_backend.js");
})();