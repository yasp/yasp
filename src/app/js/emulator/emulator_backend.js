if (typeof yasp == 'undefined') yasp = { };
importScripts('../communicator.js', '../commands.js', '../assembler/passes/generator.js', 'bitutils.js', 'disasm.js', 'emulator.js');

var emulator = new yasp.Emulator();

var debugQueue = [];
var IOUpdateLimiter = {};

setInterval(flushDebugQueue, 100);

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
      var retn = emulator.continue(data.payload.count, data.payload.skipBreakpoint);
      ready({
        payload: {},
        error: retn === true ? null : { code: retn }
      });
      break;
    case "BREAK":
      emulator.break("break_msg");
      ready({
        payload: {},
        error: null
      });
      break;
    case "SET_BREAKPOINTS":
      var retn = emulator.setBreakpoints(data.payload.breakpoints);
      ready({
        payload: {},
        error: retn === true ? null : { code: retn }
      });
      break;
    case "GET_STATE":
      var payload = {
        rom: emulator.rom,
        ram: emulator.ram,
        stack: emulator.stack.subarray(emulator.initialSP + 1, (emulator.sp + 1) - (emulator.initialSP + 1)),
        registers: {
          general: {
            b: {},
            w: {}
          },
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

      for (var i = 0; i < 32; i++) {
        payload.registers.general.b[i] = emulator.readByteRegister(i);
        payload.registers.general.w[i] = emulator.readWordRegister(i);
      }

      for (var i = 0; i < emulator.pins.length; i++) {
        var pin = emulator.pins[i];
        if(!pin)
          continue;
        payload.io.push({
          "pin": i,
          "type": pin.type,
          "mode": pin.mode,
          "state": pin.state
        });
      }

      ready({
        payload: payload,
        error: null
      });
      break;
    case "SET_STATE":
      var state = data.payload;

      if(state.io) {
        for (var i = 0; i < state.io.length; i++) {
          var io = state.io[i];

          if(!io || io.pin === undefined)
            continue;

          if(!emulator.pins[io.pin]) {
            emulator.pins[io.pin] = {
              type: "gpio",
              state: 0,
              mode: "out"
            };
          }

          var pin = emulator.pins[io.pin];

          if(io.type === "gpio" || io.type === "adc")
            pin.type = io.type;
          if(io.mode === "in" || io.mode === "out")
            pin.mode = io.mode;
          if(io.state !== undefined)
            emulator.setIO(io.pin, io.state, true);
        }
      }

      if(state.rom instanceof Uint8Array) {
        emulator.rom = state.rom;
      }

      if(state.ram instanceof Uint8Array) {
        emulator.rom = state.rom;
      }

      if(state.stack instanceof Uint8Array) {
        emulator.stack = state.stack;
      }

      if(state.registers) {
        var regs = state.registers;

        if(regs.general) {
          if(regs.general.b) {
            for (var r in regs.general.b) {
              emulator.writeByteRegister(r, regs.general.b[r]);
            }
          }
          if(regs.general.w) {
            for (var r in regs.general.w) {
              emulator.writeWordRegister(r, regs.general.w[r]);
            }
          }
        }

        if(regs.special) {
          if(typeof regs.special.pc === "number" && regs.special.pc >= 0)
            emulator.writePC(regs.special.pc);
          if(typeof regs.special.sp === "number")
            emulator.sp = regs.special.sp;
        }

        if(regs.flags) {
          emulator.writeFlags(regs.special.C, regs.special.Z);
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
  communicator.broadcast('CONTINUED', { payload: {}, error: null });
});

emulator.registerCallback('DEBUG', function (type, subtype, addr, val) {
  var log = { type: type, subtype: subtype, addr: addr, val: val };
  debugQueue.push(log);
});

function flushDebugQueue () {
  if(debugQueue.length !== 0) {
    communicator.broadcast('DEBUG', { payload: debugQueue, error: null });
    debugQueue.length = 0;
  }
}

emulator.registerCallback('IO_CHANGED', function (pin, state, mode, type) {
  var now = +new Date();
  var tt = 50;

  if(!IOUpdateLimiter[pin])
    IOUpdateLimiter[pin] = { last: 0 };

  IOUpdateLimiter[pin].state = {
    pin: pin,
    state: state,
    mode: mode,
    type: type
  };

  if(now - IOUpdateLimiter[pin].last > tt) {
    sendIOUpdate(pin);
  } else {
    IOUpdateLimiter[pin].timeout = setTimeout(function () {
      IOUpdateLimiter[pin].timeout = null;
      sendIOUpdate(pin);
    }, tt);
  }
});

function sendIOUpdate(pin) {
  communicator.broadcast('IO_CHANGED', {
    payload: IOUpdateLimiter[pin].state,
    error: null
  });

  IOUpdateLimiter[pin].last = +new Date();
}