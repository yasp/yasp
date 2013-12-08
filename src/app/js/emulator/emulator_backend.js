if (typeof yasp == 'undefined') yasp = { };
importScripts('../communicator.js', '../commands.js', '../assembler/passes/generator.js', 'bitutils.js', 'emulator.js');

var emulator = new yasp.Emulator();
var communicator = new yasp.CommunicatorBackend(self, function(data, ready) {
  switch (data.action) {
    case "LOAD":
      var retn = emulator.load(data.payload.bitcode, data.payload.start);
      ready({
        payload: {},
        error: retn === true ? null : { code: retn }
      });
      break;
    case "CONTINUE":
      var retn = emulator.continue(data.count);
      ready({
        payload: {},
        error: retn === true ? null : { code: retn }
      });
      break;
    case "BREAK":
      emulator.break("break");
      ready({
        payload: {},
        error: null
      });
      break;
    default:
      ready(yasp.Communicator.UNKNOWN_ACTION);
  }
});

emulator.registerCallback('BREAK', function (reason) {
  communicator.broadcast('BREAK', { reason: reason });
});

emulator.registerCallback('LOADED', function (start, length) {
  communicator.broadcast('LOADED', { start: start, length: length });
});

emulator.registerCallback('CONTINUED', function () {
  communicator.broadcast('CONTINUED', { });
});
