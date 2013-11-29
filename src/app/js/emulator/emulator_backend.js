if (typeof yasp == 'undefined') yasp = { };
importScripts('../communicator.js', 'bitutils.js', 'emulator.js');

var emulator = new yasp.Emulator();

new yasp.CommunicatorBackend(self, function(data, ready, broadcast) {
  switch (data.action) {
    case "LOAD":
      var retn = emulator.load(data.payload.bitcode, data.payload.start);
      ready({
        payload: {},
        error: retn === true ? null : { code: retn }
      });
      break;
    default:
      ready(yasp.Communicator.UNKNOWN_ACTION);
  }
});