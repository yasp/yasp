if (typeof yasp == 'undefined') yasp = { };
importScripts(
  '../communicator.js',
  '../commands.js',
  '../assembler/passes/generator.js',
  '../iobank/pin.js',
  '../iobank/iobank.js',
  'bitutils.js',
  'disasm.js',
  'emulator.js'
);

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
      if(data.payload.count === undefined)
        data.payload.count = null;
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
      ready({
        payload: getState(),
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

          if(io.state !== undefined) {
            emulator.setIO(io.pin, io.state, true);
          }
        }
      }

      if(state.rom instanceof Uint8Array) {
        emulator.rom = state.rom;
      }

      if(state.ram instanceof Uint8Array) {
        emulator.rom = state.rom;
      }

      if(state.stack instanceof Uint8Array) {
        for (var i = 0; i < state.stack.length; i++) {
          emulator.ram[emulator.initialSP + i] = state.stack[i];
        }
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
      state: getState(),
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

emulator.registerCallback('CONTINUE', function (running) {
  communicator.broadcast('CONTINUE', { payload: { running: running }, error: null });
});

emulator.registerCallback('DEBUG', function (type, subtype, addr, val) {
  communicator.broadcast('DEBUG', {
    payload: { type: type, subtype: subtype, addr: addr, val: val },
    error: null
  });
});

emulator.registerCallback('IO_CHANGED', function (pin, state, mode, type, tick) {
  communicator.broadcast('IO_CHANGED', {
    payload: {
      pin: pin,
      state: state,
      mode: mode,
      type: type,
      tick: tick
    },
    error: null
  });
});

function getState() {
  var state = {
    rom: emulator.rom,
    ram: emulator.ram,
    stack: emulator.ram.subarray(emulator.initialSP + 1, emulator.sp + 1),
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
    state.registers.general.b[i] = emulator.readByteRegister(i);
    state.registers.general.w[i] = emulator.readWordRegister(i);
  }

  state.io = emulator.iobank.getJSON();

  return state;
}