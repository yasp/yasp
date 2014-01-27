if (typeof yasp == 'undefined') yasp = { };

(function() {
  var debug = false;

  /**
   * Emulator is responsible for running the bytecode from the assembler.
   * Additional documentation can be found in the {@link https://github.com/yasp/yasp/blob/master/doc/emulator/emulator.md|GitHub repository}.
   * @constructor
   */
  yasp.Emulator = function() {

    /** the program code including strings, interrupt-table, etc
     * @member {Uint8Array} */
    this.rom = new Uint8Array(512);
    /** contains the registers (first 63 bytes) and RAM accessible via READRAM/WRITERAM
     * @member {Uint8Array} */
    this.ram = new Uint8Array(512);
    /** emulator flags set by arithmetic and PIN-Instructions
     * @member {Object}
     * @property {boolean} c carry flag
     * @property {boolean} z zero flag
     */
    this.flags = { c: false, z: false };

    /** number of milliseconds between two tickWrapper-calls
     * @member {Number} */
    this.tickTimeout = 1;
    /** number of ticks inside one tickWrapper call
     * @member {Number} */
    this.ticksPerTick = 3;

    /** cache for already disassembled commands
     * @member {Object} */
    this.commandCache = {};

    /** stack used by PUSH, POP, subroutines and interrupts. It is filled from index 0 to 16.
     * @member {Uint8Array} */
    this.stack = new Uint8Array(16);
    /** initial value of the stackpointer
     * @member {Number}
     * @see yasp.Emulator#stack
     * @default */
    this.initialSP = -1;
    /** offset of the top, last pushed byte in the stack
     * @member {Number}
     * @see yasp.Emulator#stack */
    this.sp = this.initialSP;

    /** offset of the last executed instruction in the {@link yasp.Emulator#rom ROM}
     * @member {Number} */
    this.pc = 0;

    /** indicator of the running-state
     * Number = execute a number of instructions
     * true = execute unlimited number of instructions
     * false = execution halted
     * @member {Number|Boolean}
     * @see yasp.Emulator#continue
     * @see yasp.Emulator#break
     * @default */
    this.running = false;

    /** number of ticks executed in total, used by PWM for timing
     * @member {Number}
     * @see yasp.Emulator#updatePwm
     * @see yasp.Emulator#tick */
    this.ticks = 0;

    /** time in milliseconds to wait for the next tick
     * @member {Number}
     * @see yasp.Emulator#wait
     * @see yasp.Emulator#tickWrapper */
    this.waitTime = 0; // time to wait in ms

    /** bits of the interrupt-mask
     * @member {boolean[]}
     * @see yasp.Emulator#setInterruptMask
     * @see yasp.Emulator#scheduleInterrupt */
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

    /** interrupt to execute on the next tick
     * @member {Number}
     * @see yasp.Emulator#tick
     * @see yasp.Emulator#setIO
     * @see yasp.Emulator#scheduleInterrupt */
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


    this.setTickWrapperTimeout();
  };

  /** fired when the execution is started or resumed.
   * @event yasp.Emulator~CONTINUED
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/messages.md#broadcast-continued|CONTINUED-Broadcast}
   */

  /** fired when the execution is halted.
   * @event yasp.Emulator~BREAK
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/messages.md#broadcast-break|BREAK-Broadcast}
   */

  /** fired when code has been loaded into the rom for execution.
   * @event yasp.Emulator~LOADED
   * @param start {Number}
   * @param length {Number}
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/messages.md#broadcast-loaded|LOADED-Broadcast}
   */

  /** fired when a DEBUG or ECHO instruction was executed.
   * @event yasp.Emulator~DEBUG
   * @param type {String}
   * @param subtype {String}
   * @param addr {Number}
   * @param val {Number}
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/messages.md#broadcast-debug|DEBUG-Broadcast}
   */

  /** fired when the state of an output-pin changed.
   * @event yasp.Emulator~IO_CHANGED
   * @param pin {Number}
   * @param state {Number}
   * @param mode {String}
   * @param type {String}
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/messages.md#broadcast-io_changed|IO_CHANGED-Broadcast}
   */

  /** Registers the callback for an event. It is not possible to register multiple callbacks for one event for performance reasons.
   * Possible events are {@link yasp.Emulator~event:CONTINUED}, {@link yasp.Emulator~event:BREAK}, {@link yasp.Emulator~event:LOADED}, {@link yasp.Emulator~event:DEBUG}, {@link yasp.Emulator~event:IO_CHANGED}
   * @param evt {String} the event name
   * @param func {function} the event callback
   * @private
   */
  yasp.Emulator.prototype.registerCallback = function (evt, func) {
    if(typeof func == "function") {
      this.events[evt] = func;
      return true;
    } else {
      return false;
    }
  };

  /** Loads the given bitcode into the ROM
   * @param bitcode {Uint8Array} bitcode to load
   * @param start {Number} address to start loading into
   * @returns {Number|Boolean}
   * @fires yasp.Emulator~LOADED
   * @private
   */
  yasp.Emulator.prototype.load = function(bitcode, start) {
    if(typeof start !== "number")
      return 3;
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

  /** Continues the execution
   * @param count {Number|boolean} number of instructions to execute or null
   * @returns {Number|boolean}
   * @fires yasp.Emulator~CONTINUED
   * @private
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

  /** Stops the execution
   * @fires yasp.Emulator~BREAK
   */
  yasp.Emulator.prototype.break = function (reason) {
    this.running = false;
    this.events.BREAK(reason);
  };

  /** sends a register to the debugger
   * @param type {String} the register-type (w or b)
   * @param addr {Number} the register-number
   * @fires yasp.Emulator~DEBUG
   */
  yasp.Emulator.prototype.debugRegister = function (type, addr) {
    var val = 0;
    if(type === "w")
      val = this.readWordRegister(addr);
    if(type === "b")
      val = this.readByteRegister(addr);
    this.events.DEBUG("register", type, addr, val);
  };

  /** sends a string to the debugger
   * @param addr {Number} ROM-address to read a null-terminated string from
   * @fires yasp.Emulator~DEBUG
   */
  yasp.Emulator.prototype.debugString = function (addr) {
    var str = "";

    while(this.rom[addr] !== 0) {
      str += String.fromCharCode(this.rom[addr]);
      addr++;
    }

    this.events.DEBUG("string", null, addr, str);
  };

  /** Writes the given value into the given byte register
   * @param r {Number} the byte-register to write to (must be between 0 and 31)
   * @param v {Number} the value to write (must be one byte)
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

  /** Reads the value of the given byte-register
   * @param r {Number} the byte-register to read (must be between 0 and 31)
   * @returns {Number} the registers value
   */
  yasp.Emulator.prototype.readByteRegister = function (r) {
    if(r < 0 || r > 31)
      return -1;
    return this.ram[r];
  };

  /** Writes the given value into the given word register
   * @param r {Number} the word-register to write to (must be between 0 and 31)
   * @param v {Number} the value to write (must be one word)
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

  /** Reads the value of the given word-register
   * @param r {Number} the word-register to read (must be between 0 and 31)
   * @returns {Number} the registers value
   */
  yasp.Emulator.prototype.readWordRegister = function (r) {
    if(r < 0 || r > 32)
      return -1;

    r = r * 2;
    return yasp.bitutils.wordFromBytes(this.ram[r], this.ram[r + 1]);
  };

  /** Reads the flags
   * @returns {object} values of both flags
   * @deprecated for speed reasons. Use {@link yasp.Emulator#isCarryFlagSet} and {@link yasp.Emulator#isZeroFlagSet}.
   */
  yasp.Emulator.prototype.readFlags = function () {
    return {
      c: this.flags.c,
      z: this.flags.z
    };
  };

  /** Reads the carry flag
   * @returns {boolean} true if the carry flag is set, otherwise false
   */
  yasp.Emulator.prototype.isCarryFlagSet = function () {
    return this.flags.c;
  };

  /** Reads the zero flag
   * @returns {boolean} true if the zero flag is set, otherwise false
   */
  yasp.Emulator.prototype.isZeroFlagSet = function () {
    return this.flags.z;
  };

  /** Write the carry and zero flag
   * @param c {?boolean} the carry flag to be set (or null to not change it)
   * @param z {?boolean} the zero flag to be set (or null to not change it)
   * @see yasp.Emulator#isCarryFlagSet
   * @see yasp.Emulator#isZeroFlagSet
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

  /** splits the given word into two bytes and pushes them onto the stack. The most significant byte will be pushed last.
   * @param v {Number} word to push onto the stack
   * @see yasp.Emulator#popWord
   */
  yasp.Emulator.prototype.pushWord = function (v) {
    if(debug) console.log("push word: " + v);
    this.stack[++this.sp] = v & 0xFF;
    this.stack[++this.sp] = v >> 8;
  };

  /** pushes one byte onto the stack
   * @param v {Number} the byte to push onto the stack
   * @see yasp.Emulator#popByte
   */
  yasp.Emulator.prototype.pushByte = function (v) {
    if(debug) console.log("push byte: " + v);
    this.stack[++this.sp] = v;
  };

  /** gets two bytes from the stack, combines and removes them
   * @returns {Number} a word from the top of stack
   * @see yasp.Emulator#pushWord
   */
  yasp.Emulator.prototype.popWord = function () {
    return yasp.bitutils.wordFromBytes(this.popByte(), this.popByte());
  };

  /** gets one byte from the stack and removes it
   * @returns {Number} a byte from the top of stack or 0 if the stack is empty
   * @see yasp.Emulator#pushByte
   */
  yasp.Emulator.prototype.popByte = function () {
    if(this.sp === -1)
      return 0;
    return this.stack[this.sp--];
  };

  /** sets the program counter
   * @param pc {Number} the new value to set
   */
  yasp.Emulator.prototype.writePC = function (pc) {
    if(debug) console.log("pc=" + pc);
    this.pc = pc;
  };

  /** gets the program counter
   * @returns {Number} the current value of the program counter
   */
  yasp.Emulator.prototype.readPC = function () {
    return this.pc;
  };

  /** writes one byte to the ram
   * @param o {Number} the position to write the byte to
   * @param v {Number} the byte to write
   * @returns {Number} 0 = success, 1 = o was out of bounds
   */
  yasp.Emulator.prototype.writeRAM = function (o, v) {
    if(o < 0 || o >= this.ram.length)
      return 1;
    this.ram[o] = v;
    return 0;
  };

  /** sets the state of a pin
   * @param p {Number} pin-number
   * @param s {Number} new state to set
   * @param [outside=false] {boolean} true if the pin was set by external hardware
   * @returns {Number} 0 if success, 1 if the pin does not exist, 2 if the pin is an input pin, 3 if s is invalid
   * @fires yasp.Emulator~IO_CHANGED
   */
  yasp.Emulator.prototype.setIO = function (p, s, outside) {
    var pin = this.pins[p];

    if(typeof s !== "number" || (s < 0 || s > 255))
      return 3;
    if(pin === undefined)
      return 1;
    if(pin.mode === "in" && outside !== true)
      return 2;

    if(s === 1 && pin.mode === "in") {
      this.scheduleInterrupt(p);
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

  /** helper function to handle PWM
   * @param p {Number} pin-number
   * @param pin {object} pin instance
   * @param s {Number} state which has been set
   * @fires yasp.Emulator~IO_CHANGED
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/emulator.md#pwm|Additional documentation}
   * @see yasp.Emulator#setIO
   * @private
   */
  yasp.Emulator.prototype.updatePwm = function (p, pin, s) {
    var now = this.ticks;

    if(s === 1) {
      if(!this.pwmStatus[p]) {
        this.pwmStatus[p] = {
          startOn: now
        };
      } else {
        var status = this.pwmStatus[p];
        var timeOn = status.startOff - status.startOn;
        var timeOff = now - status.startOff;
        var total = timeOn + timeOff;

        var percentOn = timeOn / total;
        this.events.IO_CHANGED(p, percentOn, pin.mode, pin.type);
        clearTimeout(this.pwmTimeouts[p]);

        this.pwmStatus[p] = null;
      }
    } else if(s === 0 && this.pwmStatus[p]) {
      this.pwmStatus[p].startOff = now;
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

  /** gets the state of a pin
   * @returns {?number} the pins state, or null if the pin does not exist
   */
  yasp.Emulator.prototype.getIO = function (p) {
    var pin = this.pins[p];

    if(pin === undefined)
      return null;

    return pin.state;
  };

  /** reads one byte from the ram
   * @param o {Number} the offset to read from
   * @returns {Number} the bytes value, or 0 if o was out of bounds
   */
  yasp.Emulator.prototype.readRAM = function (o) {
    if(o < 0 || o >= this.ram.length)
      return 0;
    return this.ram[o];
  };

  /** schedules an interrupt for the next tick
   * @param i {Number} the interrupt to schedule
   * @returns {boolean} true if the interrupt is going to served, false otherwise (depends on the active interrupt-mask)
   */
  yasp.Emulator.prototype.scheduleInterrupt = function (i) {
    if(this.interruptMask[i] === false)
      return false;
    if(debug) console.log("interrupt triggered: " + i);
    this.interruptToServe = i;
    return true;
  };

  /** returns to byte to jump to for a given interrupt
   * @param i {Number} the interrupt-number (pin-number)
   * @private
   */
  yasp.Emulator.prototype.getInterruptAddress = function (i) {
    i = 0x100 + (i * 2); // interrupt table starts at 0x100, each entry is 2 bytes long
    return yasp.bitutils.wordFromBytes(this.rom[i], this.rom[i + 1]);
  };

  /** sets the interrupt-mask
   * @param mask {Number} mask to set (one byte)
   * @see yasp.Emulator#interruptMask
   */
  yasp.Emulator.prototype.setInterruptMask = function (mask) {
    for (var i = 0; i < 8; i++) {
      this.interruptMask[i] = (mask & 1) === 1;
      mask = mask >> 1;
    }
  };

  /** halts the execution for a given time.
   * @param ticks {Number} number of ticks to wait (1 tick ~= 0.015ms; 60000 ~= 900ms)
   */
  yasp.Emulator.prototype.wait = function (ticks) {
    var ms = ticks * 0.015;
    if(debug) console.log("wait " + ms + "ms");
    this.waitTime = ms;
  };

  /** set the timeout for the next tickWrapper-call
   * @private
   * @see yasp.Emulator#tickTimeout
   * @see yasp.Emulator#tickWrapper
   */
  yasp.Emulator.prototype.setTickWrapperTimeout = function () {
    setTimeout(this.tickWrapper.bind(this), this.tickTimeout);
  };

  /** helper function, invoked by setTimeout, calls {@link yasp.Emulator#tick}. Do not call manually.
   * @private
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/emulator.md#ticks|Additional documentation}
   * @see yasp.Emulator#ticksPerTick
   * @see yasp.Emulator#running
   * @see yasp.Emulator#break
   * @see yasp.Emulator#continue
   */
  yasp.Emulator.prototype.tickWrapper = function () {

    for(var jj = 0; jj < this.ticksPerTick; jj++) {

      if(this.running === false) {
        break;
      }

      if(typeof this.running === "number") {
        this.running--;

        if(this.running < 0) {
          this.break("count");
          break;
        }
      }

      if(this.waitTime !== 0) {
        if(this.running === 0) { // ignore WAIT/PAUSE when stepping
          this.running = 1;
          this.setTickWrapperTimeout();
        } else {
          // don't set the normal timeout but wait for the desired time
          setTimeout(this.tickWrapper.bind(this), this.waitTime);
        }

        // fix the number of ticks executed. This has to be accurate since PWM relies on the tick-count
        // to calculate for how long a pin was high or low.
        var timePerTick = this.tickTimeout / this.ticksPerTick;
        var ticksSkipped = (this.waitTime / timePerTick);
        this.ticks += ticksSkipped;
        this.waitTime = 0;
        return;
      }

      this.tick();
    }

    this.setTickWrapperTimeout();
  };

  /** Executes instructions. Do not call manually.
   * @private
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/emulator.md#ticks|Additional documentation}
   */
  yasp.Emulator.prototype.tick = function () {
    this.ticks++;

    // interrupts
    if(this.interruptToServe !== -1) {
      if(debug) console.log("interrupt jumped: " + this.interruptToServe);
      this.pushWord(this.pc); // for RETI
      this.pc = this.getInterruptAddress(this.interruptToServe);
      this.interruptToServe = -1;
    }

    // fetch instruction
    if(this.commandCache[this.pc] === undefined) {
      this.commandCache[this.pc] = yasp.disasm.getCommand(this.rom, this.pc);
    }

    var ccmd = this.commandCache[this.pc];
    var cmd = ccmd.cmd;

    // increment the program counter by the length of the instruction in the ROM
    this.writePC(this.pc + ccmd.neededBytes);

    if(debug) console.log(ccmd.str);

    // the loaded value of p0 is needed by the zero-flag-checking
    var p0 = ccmd.params[0];

    // load the values of register and pin-parameters. This is an unrolled loop, limited to two parameters for speed
    // reasons. In addition it is possible to skip loading of certain values by adding valueNeeded=false to the
    // instruction file. Refer to the instruction documentation for further details:
    //                   https://github.com/yasp/yasp/blob/master/doc/instructions.md
    if(ccmd.params.length === 0) {
      cmd.exec.call(this);
    } else {
      if(p0.valueNeeded) {
        // isRByte, isRWord and isPin are added by yasp.disasm.getCommand
        // checking the booleans is way faster than comparing the type-string of each instruction.
        if(p0.isRByte === true)
          p0.value = this.readByteRegister(p0.address);
        else if(p0.isRWord === true)
          p0.value = this.readWordRegister(p0.address);
        else if(p0.isPin === true)
          p0.value = this.getIO(p0.address);
      }

      if(ccmd.params.length === 1) {
        cmd.exec.call(this, p0);
      } else if(ccmd.params.length === 2) {
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
        throw "Instructions with more than 2 parameters are not supported.";
      }
    }

    // check the zero-flag if specified in the instruction-file
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
