if (typeof yasp == 'undefined') yasp = { };

(function() {
  var debug = false;

  /**
   * Emulator is responsible for running the bytecode from the assembler
   * @constructor
   */
  yasp.Emulator = function() {
    this.rom = new Uint8Array(512); // bitcode
    this.ram = new Uint8Array(512); // registers
    this.flags = { c: false, z: false };

    this.tickTimeout = 1;
    this.ticksPerTick = 3;

    this.commandCache = {}; // parsed commands

    this.stack = new Uint8Array(16);
    this.initialSP = -1;
    this.sp = this.initialSP;

    this.pc = 0;

    this.running = false;

    this.ticks = 0; // tick-counter (used for PWM)

    this.waitTime = 0; // time to wait in ms

    // bits of interrupt-mask
    // set by ENABLE, DISABLE
    this.interruptMask = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ];

    // set by interrupt-sources (e.g. pins)
    // checked in tick()
    this.interruptToServe = -1;

    // status (waiting for high or low) and timeout-ids for PWM
    this.pwmStatus = {};
    this.pwmTimeouts = {};

    // pin definitions (see setIO, getIO and interrupts)
    this.pins = [];
    this.pins[0] = null;
    this.pins[1] = {
        type: "gpio",
        state: 0,
        mode: "in"
      };
    this.pins[2] = {
        type: "gpio",
        state: 0,
        mode: "in"
      };
    // LEDs
    this.pins[3] =  {
        type: "gpio",
        state: 0,
        mode: "out"
      };
    this.pins[4] =  {
        type: "gpio",
        state: 0,
        mode: "out"
      };
    this.pins[5] = {
        type: "gpio",
        state: 0,
        mode: "out"
      };
    this.pins[6] = null;
    this.pins[7] = null;
    this.pins[8] = null;
    this.pins[9] = null;
    // ADC0
    this.pins[10] = {
        type: "adc",
        state: 0,
        mode: "in"
      };
    // ADC1
    this.pins[11] = {
        type: "adc",
        state: 0,
        mode: "in"
      };
    // ADC2
    this.pins[12] = {
        type: "adc",
        state: 0,
        mode: "in"
      };

    // events
    this.noop = function () {};
    this.events = {
      'CONTINUED': this.noop,
      'BREAK': this.noop,
      'LOADED': this.noop,
      'DEBUG': this.noop,
      'IO_CHANGED': this.noop
    };

    setTimeout(this.tickWrapper.bind(this), this.tickTimeout);
  };

  /**
   * @function Registers the callback for an event. It is not possible to register multiple callbacks for one event for performance reasons.
   * @param evt the event name
   * @param func the event callback
   */
  yasp.Emulator.prototype.registerCallback = function (evt, func) {
    if(typeof func == "function") {
      this.events[evt] = func;
      return true;
    } else {
      return false;
    }
  };

  /**
   * @function Loads the given bitcode into the ROM
   * @param bitcode bitcode to load
   * @param start address to start loading into
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.load = function(bitcode, start) {
    if(start < 0 || start >= this.rom.length)
      return 0;
    if(!(bitcode instanceof Uint8Array))
      return 2;
    if(start + bitcode.length >= this.rom.length)
      return 1;

    this.rom.set(bitcode, start);
    this.commandCache = {};
    this.events.LOADED(start, bitcode.length);
    return true;
  };

  /**
   * @function Continues the execution
   * @param count number of instructions to execute or null
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.continue = function (count) {
    if(count == null) {
      this.running = true;
    } else if(typeof count == "number") {
      if(count < 0)
        return 0;
      this.running = +count;
    } else {
      return 1;
    }

    this.events.CONTINUED();
    return true;
  };

  /**
   * @function Stops the execution
   */
  yasp.Emulator.prototype.break = function (reason) {
    this.running = false;
    this.events.BREAK(reason);
  };

  /**
   * @function sends a register to the debugger
   * @param type the register-type (w or b)
   * @param addr the register-number
   * @param val the value to send
   */
  yasp.Emulator.prototype.debugRegister = function (type, addr, val) {
    this.events.DEBUG("register", type, addr, val);
  };

  /**
   * @function sends a string to the debugger
   * @param addr address to read a null-terminated string from
   */
  yasp.Emulator.prototype.debugString = function (addr) {
    var str = "";

    while(this.rom[addr] !== 0) {
      str += String.fromCharCode(this.rom[addr]);
      addr++;
    }

    this.events.DEBUG("string", null, addr, str);
  };

  /**
   * @function Writes the given value into the given byte register
   * @param r the byte-register to write to
   * @param v the value to write
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.writeByteRegister = function (r, v) {
    if(r < 0 || r > 32)
      return 0;
    if(v < 0 || v > 255)
      return 1;
    this.ram[r] = v;
    if(debug) console.log("b" + r + "=" + v);
    return true;
  };

  /**
   * @function Reads the given value at the given byte
   * @param r the byte-register to read
   * @returns {Number}
   */
  yasp.Emulator.prototype.readByteRegister = function (r) {
    if(r < 0 || r > 31)
      return -1;
    return this.ram[r];
  };

  /**
   * @function Writes the given value into the given word register
   * @param r the word-register to write to
   * @param v the value to write
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.writeWordRegister = function (r, v) {
    if(r < 0 || r > 32)
      return 0;
    if(v < 0 || v > 65535)
      return 1;

    if(debug) console.log("w" + r + "=" + v);

    r = r * 2;
    yasp.bitutils.bytesFromWord(v, this.ram, r);
    return true;
  };

  /**
   * @function Reads the given value at the given word
   * @param r the word-register to read
   * @returns {Number}
   */
  yasp.Emulator.prototype.readWordRegister = function (r) {
    if(r < 0 || r > 32)
      return -1;

    r = r * 2;
    return yasp.bitutils.wordFromBytes(this.ram[r], this.ram[r + 1]);
  };

  /**
   * @function Reads the flags
   * @returns object containing the flag-values
   */
  yasp.Emulator.prototype.readFlags = function () {
    return {
      c: this.flags.c,
      z: this.flags.z
    };
  };

  /**
   * @function Reads the carry flag
   * @returns boolean true if the carry flag is set, otherwise false
   */
  yasp.Emulator.prototype.isCarryFlagSet = function () {
    return this.flags.c;
  };

  /**
   * @function Reads the zero flag
   * @returns boolean true if the zero flag is set, otherwise false
   */
  yasp.Emulator.prototype.isZeroFlagSet = function () {
    return this.flags.z;
  };

  /**
   * @function Write the flags
   * @param c the carry flag to be set (or null)
   * @param z the zero flag to be set (or null)
   */
  yasp.Emulator.prototype.writeFlags = function (c, z) {
    if(c === true || c === false)
    {
      if(debug) console.log("c=" + c);
      this.flags.c = c;
    }
    if(z === true || z === false)
    {
      if(debug) console.log("z=" + z);
      this.flags.z = z;
    }
  };

  /**
   * @function splits the given word into two bytes and pushes them onto the stack
   * @param v to word to push onto the stack
   * @see Emulator#popWord
   */
  yasp.Emulator.prototype.pushWord = function (v) {
    if(debug) console.log("push word: " + v);
    this.stack[++this.sp] = v & 0xFF;
    this.stack[++this.sp] = v >> 8;
  };

  /**
   * @function pushes one byte onto the stack
   * @param v the byte to push onto the stack
   * @see Emulator#popByte
   */
  yasp.Emulator.prototype.pushByte = function (v) {
    if(debug) console.log("push byte: " + v);
    this.stack[++this.sp] = v;
  };

  /**
   * @function gets two bytes from the stack, combines and removes them
   * @returns a word from the top of stack
   * @see Emulator#pushWord
   */
  yasp.Emulator.prototype.popWord = function () {
    return yasp.bitutils.wordFromBytes(this.popByte(), this.popByte());
  };

  /**
   * @function gets one byte from the stack and removed it
   * @returns a byte from the top of stack or 0 if the stack is empty
   * @see Emulator#pushByte
   */
  yasp.Emulator.prototype.popByte = function () {
    if(this.sp === -1)
      return 0;
    return this.stack[this.sp--];
  };

  /**
   * @function sets the program counter
   * @param pc the new value to set
   */
  yasp.Emulator.prototype.writePC = function (pc) {
    if(debug) console.log("pc=" + pc);
    this.pc = pc;
  };

  /**
   * @function gets the program counter
   * @returns number the current value of the program counter
   */
  yasp.Emulator.prototype.readPC = function () {
    return this.pc;
  };

  /**
   * @function writes one byte to the ram
   * @param o the position to write the byte to
   * @param v the byte to write
   * @returns number 0 is success, 1 if o was out of bounds
   */
  yasp.Emulator.prototype.writeRAM = function (o, v) {
    if(o < 0 || o >= this.ram.length)
      return 1;
    this.ram[o] = v;
    return 0;
  };

  /**
   * @function sets the state of a pin
   * @param p pin-number
   * @param s new state to set
   * @param outside true if the pin was set by the environment
   * @returns number 0 if success, 1 if the pin does not exist, 2 if the pin is an input pin, 3 if s is invalid
   */
  yasp.Emulator.prototype.setIO = function (p, s, outside) {
    var pin = this.pins[p];

    if(typeof s !== "number" || (s < 0 || s > 255))
      return 3;
    if(pin === undefined)
      return 1;
    if(pin.mode === "in" && outside !== true)
      return 2;

    if(s === 1) {
      this.triggerInterrupt(p);
    }

    if(debug) console.log("p" + p + "=" + s + " (outside: " + (!!outside) + ")");
    pin.state = s;

    if(outside !== true) {
      this.updatePwm(p, pin, s);
    } else {
      this.events.IO_CHANGED(p, s, pin.mode, pin.type);
      this.pwmTimeouts[p] = null;
      this.pwmStatus[p] = null;
    }

    return 0;
  };

  /**
   * @function helper function to handle PWM
   * @param p pin-number
   * @param pin pin instance
   * @param s state which has been set
   */
  yasp.Emulator.prototype.updatePwm = function (p, pin, s) {
    var now = this.ticks;

    if(s === 1) {
      if(!this.pwmStatus[p]) {
        this.pwmStatus[p] = {
          timeOn: now
        };
      } else {
        var ss = this.pwmStatus[p];
        var tOn = ss.timeOff - ss.timeOn;
        var tOff = now - ss.timeOff;
        var total = tOn + tOff;

        var x = tOn / total;
        this.events.IO_CHANGED(p, x, pin.mode, pin.type);
        clearTimeout(this.pwmTimeouts[p]);

        this.pwmStatus[p] = null;
      }
    } else if(s === 0 && this.pwmStatus[p]) {
      this.pwmStatus[p].timeOff = now;
    }

    if(this.pwmTimeouts[p]) {
      if(this.pwmTimeouts[p].state === s)
        return;
      clearTimeout(this.pwmTimeouts[p].timeoutId);
      this.pwmTimeouts[p] = null;
    }

    this.pwmTimeouts[p] =  {
      state: s,
      timeoutId: setTimeout(function () {
        this.events.IO_CHANGED(p, s, pin.mode, pin.type);
        this.pwmStatus[p] = null;
      }.bind(this), 100)
    };
  };

  /**
   * @function gets the state of a pin
   * @returns number or boolean depending on the pin-type, false if the pin does not exist
   */
  yasp.Emulator.prototype.getIO = function (p) {
    var pin = this.pins[p];

    if(pin === undefined)
      return null;

    return pin.state;
  };

  /**
   * @function reads one byte from the ram
   * @param o the position to write the byte to
   * @returns number the read byte, or 0 if o was out of bounds
   */
  yasp.Emulator.prototype.readRAM = function (o) {
    if(o < 0 || o >= this.ram.length)
      return 0;
    return this.ram[o];
  };

  /**
   * @function triggers an interrupt for the next tick
   * @param i the interrupt to trigger
   * @returns boolean true if the interrupt is going to served, false otherwise (depends on the active interrupt-mask)
   */
  yasp.Emulator.prototype.triggerInterrupt = function (i) {
    if(this.interruptMask[i] === false)
      return false;
    if(debug) console.log("interrupt triggered: " + i);
    this.interruptToServe = i;
    return true;
  };

  /**
   * @function returns to byte to jump to for a given interrupt
   * @param i the interrupt
   */
  yasp.Emulator.prototype.getInterruptAddress = function (i) {
    i = 0x100 + (i * 2); // interrupt table starts at 0x100, each entry is 2 bytes long
    return yasp.bitutils.wordFromBytes(this.rom[i], this.rom[i + 1]);
  };

  /**
   * @function sets the interrupt-mask
   * @param mask mask to set
   */
  yasp.Emulator.prototype.setInterruptMask = function (mask) {
    for (var i = 0; i < 8; i++) {
      this.interruptMask[i] = (mask & 1) === 1;
      mask = mask >> 1;
    }
  };

  /**
   * @function waits for a given time
   * @param ticks number of ticks to wait
   */
  yasp.Emulator.prototype.wait = function (ticks) {
    var ms = ticks * 0.015;
    if(debug) console.log("wait " + ms + "ms");
    this.waitTime = ms;
  };

  yasp.Emulator.prototype.setTickWrapperTimeout = function () {
    setTimeout(this.tickWrapper.bind(this), this.tickTimeout);
  };

  yasp.Emulator.prototype.tickWrapper = function () {
    for(var jj = 0; jj < this.ticksPerTick; jj++) {

      if(this.running === false) {
        this.setTickWrapperTimeout();
        return;
      }

      if(typeof this.running === "number") {
        this.running--;

        if(this.running === -1) {
          this.break("count");
          this.setTickWrapperTimeout();
          return;
        }
      }

      if(this.waitTime !== 0 && this.running !== 0) { // ignore WAIT/PAUSE
        setTimeout(this.tickWrapper.bind(this), this.waitTime);
        var timePerTick = this.tickTimeout / this.ticksPerTick;
        this.ticks += (this.waitTime / timePerTick);
        this.waitTime = 0;
        return;
      }

      this.tick();
    }

    this.setTickWrapperTimeout();
  };

  yasp.Emulator.prototype.tick = function () {
    this.ticks++;

    if(this.interruptToServe !== -1) {
      if(debug) console.log("interrupt jumped: " + this.interruptToServe);
      this.pushWord(this.pc); // for RETI
      this.pc = this.getInterruptAddress(this.interruptToServe);
      this.interruptToServe = -1;
    }

    if(this.commandCache[this.pc] === undefined) {
      this.commandCache[this.pc] = yasp.disasm.getCommand(this.rom, this.pc);
    }

    var ccmd = this.commandCache[this.pc];
    var cmd = ccmd.cmd;

    this.writePC(this.pc + ccmd.neededBytes);

    if(debug) console.log(ccmd.str);

    var p0 = ccmd.params[0];

    if(ccmd.params.length === 0) {
      cmd.exec.call(this);
    } else {
      if(p0.valueNeeded) {
        if(p0.isRByte === true)
          p0.value = this.readByteRegister(p0.address);
        else if(p0.isRWord === true)
          p0.value = this.readWordRegister(p0.address);
        else if(p0.isPin === true)
          p0.value = this.getIO(p0.address);
      }

      if(ccmd.params.length === 2) {
        var p1 = ccmd.params[1];
        if(p1.valueNeeded) {
          if(p1.isRByte === true)
            p1.value = this.readByteRegister(p1.address);
          else if(p1.isRWord === true)
            p1.value = this.readWordRegister(p1.address);
          else if(p1.isPin === true)
            p1.value = this.getIO(p1.address);
        }

        cmd.exec.call(this, p0, p1);
      } else {
        cmd.exec.call(this, p0);
      }
    }

    if(cmd.checkFlags !== undefined && p0 !== undefined) {
      var newVal;

      if(p0.isRByte === true)
        newVal = this.readByteRegister(p0.address);
      else if(p0.isRWord === true)
        newVal = this.readWordRegister(p0.address);

      var z = null;

      if(cmd.checkFlags.z !== undefined) {
        z = (newVal === 0);
      }

      this.writeFlags(null, z);
    }
  };
})();
