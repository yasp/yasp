if (typeof yasp == 'undefined') yasp = { };
importScripts('../communicator.js', '../commands.js', '../assembler/passes/generator.js', 'bitutils.js', 'disasm.js', 'emulator.js');

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
      var retn = emulator.continue(data.payload.count);
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
    case "GET_STATE":
      if(emulator.running !== false) {
        return ready({
          payload: {},
          error: { code: 0 }
        });
      }

      var payload = {
        rom: emulator.rom,
        ram: emulator.ram,
        registers: {
          general: null,
          special: {
            pc: emulator.pc,
            sp: emulator.sp
          },
          flags: {
            C: emulator.flags.c,
            Z: emulator.flags.z
          }
        },
        io: []
      };

      ready({
        payload: payload,
        error: null
      });
      break;
    case "SET_STATE":
      if(data.payload.io) {
        for (var i = 0; i < data.payload.io.length; i++) {
          var io = data.payload.io[i];

          if(io.pin === undefined)
            continue;

          var pin = emulator.pins[io.pin];

          if(io.type)
            pin.type = io.type;
          if(io.mode)
            pin.mode = io.mode;
          if(io.state !== undefined)
            emulator.setIO(io.pin, io.state, true);
        }
      }

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
  communicator.broadcast('BREAK', {
    payload: {
      reason: reason
    },
    error: null
  });
});

emulator.registerCallback('LOADED', function (start, length) {
  communicator.broadcast('LOADED', {
    payload: {
      start: start,
      length: length
    },
    error: null
  });
});

emulator.registerCallback('CONTINUED', function () {
  communicator.broadcast('CONTINUED', { payload: null, error: null });
});

emulator.registerCallback('IO_CHANGED', function (pin, state, mode, type) {
  communicator.broadcast('IO_CHANGED', {
    payload: {
      "pin": pin,
      "type": type,
      "mode": mode,
      "state": state
    },
    error: null
  });
});
