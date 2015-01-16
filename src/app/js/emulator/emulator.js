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
    /** contains the registers (first 63 bytes), stack and RAM accessible via ReadRAM/WriteRAM
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
    this.tickDelay = 50;
    /** number of ticks inside one tickWrapper call
     * @member {Number} */
    this.ticksPerTick = 150;
    /** timeout id of the last tickWrapper-setTimeout
     * @member {Number} */
    this.tickTimeout = 0;

    /** cache for already disassembled commands
     * @member {Object} */
    this.commandCache = {};

    /** initial value of the stackpointer
     * @member {Number}
     * @default */
    this.initialSP = 0x50;
    /** offset of the top, last pushed byte in the stack. Points to a byte in the ram.
     * @member {Number}
     */
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

    /** reason for the current break, if any.
     * @member {String}
     * @see yasp.Emulator#continue
     * @see yasp.Emulator#break
     * @default */
    this.breakReason = null;

    /** number of ticks executed in total, used by PWM for timing
     * @member {Number}
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

    /** do not ever execute a tick unless {@link yasp.Emulator#tick} is called directly. This is used by the test-suite and should not be used by anything else.
     * @member {boolean}
     * @see yasp.Emulator#setTickWrapperTimeout */
    this.forceStep = false;

    this.skipBreakpoint = false;

    /** if PWM is enabled or disabled (used by test suite)
     * @type {boolean}
     */
    this.pwmEnabled = true;

    // pin definitions (see setIO, getIO and interrupts)
    this.iobank = new yasp.IOBank();
    this.iobank.addPins([
      // buttons
      new yasp.Pin(1, "gpio", "in", false, this),
      new yasp.Pin(2, "gpio", "in", false, this),
      // LEDs
      new yasp.Pin(3, "gpio", "out", true, this),
      new yasp.Pin(4, "gpio", "out", true, this),
      new yasp.Pin(5, "gpio", "out", true, this),
      // ADC0 - ADC2
      new yasp.Pin(10, "adc", "in", false, this),
      new yasp.Pin(11, "adc", "in", false, this),
      new yasp.Pin(12, "adc", "in", false, this)
    ]);

    this.iobank.setStateChangedEvent((function (pin) {
        this.events.IO_CHANGED(pin.nr, pin.state, pin.mode, pin.type);
        if(this.changeBreakpoints.io === true) this.changeBreakpointData.io.push(pin.nr);
      }).bind(this)
    );

    // events
    this.noop = function () {};
    this.events = {
      'CONTINUE': this.noop,
      'BREAK': this.noop,
      'LOADED': this.noop,
      'DEBUG': this.noop,
      'IO_CHANGED': this.noop
    };

    /** offsets in ROM which have a breakpoint set
     * @member {boolean[]}
     * @see yasp.Emulator#setBreakpoints */
    this.breakpoints = new Array(this.rom.length);
    for (var i = 0; i < this.breakpoints.length; i++) {
      this.breakpoints[i] = false;
    }

    /** Flags for 'change'-breakpoints. If one of these is true write-actions to the specific value will be recored.
     */
    this.changeBreakpoints = {
      rbyte: false,
      rword: false,
      zflag: false,
      cflag: false,
      io: false,
      ram: false,
      rom: false
    };

    /** stores the changes to registers, flags, io and so on. Only written if a change-breakpoint for the specific value is set.
     * @member {object}
     */
    this.changeBreakpointData = {};

    for (var c in this.changeBreakpoints) {
      this.changeBreakpointData[c] = new Array(10);
      this.changeBreakpointData[c].length = 0;
    }

    /** conditions for breakpoints, null means no condition.
     * {@link https://github.com/yasp/yasp/blob/master/doc/emulator/data.md#breakpoints|Additional documentation}.
     * @member {object[]}
     * @see yasp.Emulator#setBreakpoints */
    this.breakpointConditions = new Array(this.rom.length);
    for (var i = 0; i < this.breakpointConditions.length; i++) {
      this.breakpointConditions[i] = false;
    }

    /** all breakpoins which do not have a offset-value.
     * {@link https://github.com/yasp/yasp/blob/master/doc/emulator/data.md#breakpoints|Additional documentation}.
     * @member {object[]}
     * @see yasp.Emulator#setBreakpoints */
    this.globalBreakpoints = [];

    this.setTickWrapperTimeout();
  };

  /** fired when the execution is started or resumed.
   * @event yasp.Emulator~CONTINUE
   * @param running {Number}
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/messages.md#broadcast-continue|CONTINUE-Broadcast}
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
    if(typeof func === "function") {
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
    this.clearCommandCache(start, bitcode.length);
    this.events.LOADED(start, bitcode.length);
    return true;
  };

  /** Continues the execution
   * @param count {Number|boolean} number of instructions to execute or null
   * @param skipBreakpoint {boolean} if the next (and only that one) breakpoint should be skipped
   * @returns {Number|boolean}
   * @fires yasp.Emulator~CONTINUE
   * @private
   */
  yasp.Emulator.prototype.continue = function (count, skipBreakpoint) {
    if(count === null) {
      this.running = true;
    } else if(typeof count === "number") {
      if(count < 0)
        return 0;
      this.running = +count;
    } else {
      return 1;
    }

    this.breakReason = null;
    this.skipBreakpoint = !!skipBreakpoint;
    this.setTickWrapperTimeout(0);

    this.events.CONTINUE(this.running);
    return true;
  };

  /** Stops the execution
   * @fires yasp.Emulator~BREAK
   */
  yasp.Emulator.prototype.break = function (reason) {
    this.running = false;
    this.breakReason = reason;
    this.events.BREAK(reason);
  };

  /** updates the internal list of breakpoints
   * @param breakpoints {Breakpoint[]} the breakpoints to save.
   *        {@link https://github.com/yasp/yasp/blob/master/doc/emulator/data.md#breakpoints|Additional documentation}.
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.setBreakpoints = function (breakpoints) {
    if(!(breakpoints instanceof Array))
      return 0;

    this.globalBreakpoints.length = 0;

    for (var i = 0; i < this.breakpoints.length; i++) {
      this.breakpoints[i] = false;
      this.breakpointConditions[i] = null;
    }

    for (var r in this.changeBreakpoints) {
      this.changeBreakpoints[r] = false;
    }


    for (var i = 0; i < breakpoints.length; i++) {
      var brk = breakpoints[i];

      if(brk.offset !== null && brk.offset !== undefined) {
        this.breakpoints[brk.offset] = true;
      }

      if(brk.condition === null || brk.condition === undefined)
        continue;

      var condition = {};

      condition.boolValue = (brk.condition.value === true);
      condition.numValue = +brk.condition.value;
      condition.uintArrayValue = (brk.condition.value instanceof Uint8Array) ? brk.condition.value : new Uint8Array();

      condition.isBoolValue = false;
      condition.isNumValue = false;
      condition.isUintArrayValue = false;

      if(brk.condition.type === "register") {
        condition.isByteRegister = (brk.condition.param.charAt(0) === "b");
        condition.isWordRegister = (brk.condition.param.charAt(0) === "w");
        condition.registerNumber = +brk.condition.param.substring(1);
        condition.isNumValue = true;
      }

      if(brk.condition.type === "flag") {
        condition.isCarryFlag = (brk.condition.param === "c");
        condition.isZeroFlag = (brk.condition.param === "z");
        condition.isBoolValue = true;
      }

      if(brk.condition.type === "io") {
        condition.isIO = true;
        condition.ioPinNumber = +brk.condition.param;
        condition.isNumValue = true;
      }

      if(brk.condition.type === "ram" || brk.condition.type === "rom") {
        condition.isRamOffset = (brk.condition.type === "ram");
        condition.isRomOffset = (brk.condition.type === "rom");
        condition.memoryOffset = +brk.condition.param;

        if(brk.condition.value instanceof Uint8Array)
          condition.isUintArrayValue = true;
        else
          condition.isNumValue = true;
      }

      condition.isEquals        = (brk.condition.operator === "=");
      condition.isNotEquals     = (brk.condition.operator === "!=");
      condition.isSmaller       = (brk.condition.operator === "<");
      condition.isBigger        = (brk.condition.operator === ">");
      condition.isSmallerEquals = (brk.condition.operator === "<=");
      condition.isBiggerEquals  = (brk.condition.operator === ">=");
      condition.isChange        = (brk.condition.operator === "change");

      if(condition.isChange) {
        if(condition.isByteRegister === true) this.changeBreakpoints["rbyte"] = true;
        if(condition.isWordRegister === true) this.changeBreakpoints["rword"] = true;
        if(condition.isCarryFlag    === true) this.changeBreakpoints["cflag"] = true;
        if(condition.isZeroFlag     === true) this.changeBreakpoints["zflag"] = true;
        if(condition.isIO           === true) this.changeBreakpoints["io"]    = true;
        if(condition.isRamOffset    === true) this.changeBreakpoints["ram"]   = true;
        if(condition.isRomOffset    === true) this.changeBreakpoints["rom"]   = true;
      }


      if(brk.offset !== null && brk.offset !== undefined) {
        this.breakpointConditions[brk.offset] = condition;
      } else {
        this.globalBreakpoints.push(condition);
      }
    }

    return true;
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
    if(this.changeBreakpoints.rbyte === true) this.changeBreakpointData.rbyte.push(r);

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
    if(this.changeBreakpoints.rword === true) this.changeBreakpointData.rword.push(r);

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
      if(this.changeBreakpoints.cflag === true) this.changeBreakpointData.cflag.push(true);

      this.flags.c = c;
    }
    if(z === true || z === false)
    {
      if(debug) console.log("z=" + z);
      if(this.changeBreakpoints.zflag === true) this.changeBreakpointData.zflag.push(true);

      this.flags.z = z;
    }
  };

  /** splits the given word into two bytes and pushes them onto the stack. The most significant byte will be pushed last.
   * @param v {Number} word to push onto the stack
   * @see yasp.Emulator#popWord
   */
  yasp.Emulator.prototype.pushWord = function (v) {
    if(debug) console.log("push word: " + v);
    this.ram[++this.sp] = v & 0xFF;
    this.ram[++this.sp] = v >> 8;
  };

  /** pushes one byte onto the stack
   * @param v {Number} the byte to push onto the stack
   * @see yasp.Emulator#popByte
   */
  yasp.Emulator.prototype.pushByte = function (v) {
    if(debug) console.log("push byte: " + v);
    this.ram[++this.sp] = v;
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
    if(this.sp === this.initialSP)
      return 0;
    return this.ram[this.sp--];
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

    if(debug) console.log("ram[" + o + "] = " + v);
    if(this.changeBreakpoints.ram === true) this.changeBreakpointData.ram.push(o);

    return 0;
  };

  /** writes one byte to the rom. This also clears the {@link yasp.Emulator#commandCache} for the affected bytes.
   * @param o {Number} the position to write the byte to
   * @param v {Number} the byte to write
   * @returns {Number} 0 = success, 1 = o was out of bounds
   * @see yasp.Emulator#clearCommandCache
   */
  yasp.Emulator.prototype.writeROM = function (o, v) {
    if(o < 0 || o >= this.rom.length)
      return 1;

    this.rom[o] = v;

    if(debug) console.log("rom[" + o + "] = " + v);
    if(this.changeBreakpoints.rom === true) this.changeBreakpointData.rom.push(o);

    this.clearCommandCache(o, 1);

    return 0;
  };

  /** checks if the given byte is the start of a command in ROM
   * @param pos {Number} the position in ROM to check
   * @returns {Boolean} true, if pos is the start of a command, otherwise false
   */
  yasp.Emulator.prototype.isCacheCommand = function (pos) {
    return (this.commandCache[pos] !== undefined && this.commandCache[pos] !== true);
  };

  /** clears the command cache for all bytes in ROM affected by the change of the len
   * bytes starting at pos. An affected byte is either within that range, or of any
   * command, which is partly within that range.
   * @param pos {Number} starting position to clear
   * @param len {Number} number of types to clear
   */
  yasp.Emulator.prototype.clearCommandCache = function (pos, len) {
    var endPos = pos + len;
    var cmd = null;
    var firstCmdPos = pos;

    // backtrack to the first command before pos
    for (; firstCmdPos > 0; firstCmdPos--) {
      if (this.isCacheCommand(firstCmdPos)) {
        cmd = this.commandCache[firstCmdPos];
        break;
      }
    }

    // check if an command has been found and if yes, if it is affected
    if(cmd === null || firstCmdPos + (cmd.neededBytes - 1) < pos) {
      // case 1: found command is before the area to clear
      //     ----CMD--000000------
      // case 2: there was no command before pos
      //
      // => do nothing and keep pos as is
    } else {
      // case 3: found command is intersects with the area to clear
      //     ----CM000000---------
      // => set pos to the start of found command, since we're
      //    clearing part of its bytes

      pos = firstCmdPos;
      endPos = Math.max(endPos, pos + (cmd.neededBytes - 1));
    }

    // clear bytes and keep looking for commands within range.
    // If there is a command found, which starts in the range
    // but is longer than the range itself, the range is updated
    // accordingly.
    for(; pos < endPos; pos++) {
      if (this.isCacheCommand(pos)) {
        cmd = this.commandCache[pos];
        endPos = Math.max(endPos, pos + cmd.neededBytes);
      }

      this.commandCache[pos] = undefined;
    }
  };

  /** disables PWM simulation for all pins
   */
  yasp.Emulator.prototype.disablePwm = function () {
    this.pwmEnabled = false;
  };

  /** sets the state of a pin
   * @param p {Number} pin-number
   * @param s {Number} new state to set
   * @param [outside=false] {boolean} true if the pin was set by external hardware
   * @returns {Number} 0 if success, 1 if the pin does not exist, 2 if the pin is an input pin, 3 if s is invalid
   * @fires yasp.Emulator~IO_CHANGED
   */
  yasp.Emulator.prototype.setIO = function (p, s, outside) {
    var pin = this.iobank.getPin(p);

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

    pin.setState(s, outside || !this.pwmEnabled);

    return 0;
  };

  /** gets the state of a pin
   * @returns {?number} the pins state, or null if the pin does not exist
   */
  yasp.Emulator.prototype.getIO = function (p) {
    var pin = this.iobank.getPin(p);

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

  /** reads one byte from the rom
   * @param o {Number} the offset to read from
   * @returns {Number} the bytes value, or 0 if o was out of bounds
   */
  yasp.Emulator.prototype.readROM = function (o) {
    if(o < 0 || o >= this.rom.length)
      return 0;
    return this.rom[o];
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
    this.setTickWrapperTimeout(0);
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

  /** set the timeout for the next tickWrapper-call. This also cancels all running timeouts.
   * @param delay {Number} milliseconds to wait before the next tick
   * @private
   * @see yasp.Emulator#tickTimeout
   * @see yasp.Emulator#tickDelay
   * @see yasp.Emulator#tickWrapper
   */
  yasp.Emulator.prototype.setTickWrapperTimeout = function (delay) {
    if(this.forceStep === true)
      return;
    if(delay === undefined)
      delay = this.tickDelay;
    clearTimeout(this.tickTimeout);
    this.tickTimeout = setTimeout(this.tickWrapper.bind(this), delay);
  };

  /**
   * @returns {Number} number of ticks executed, since the emulator has been created. This also takes sleeps into account.
   */
  yasp.Emulator.prototype.getTicks = function () {
    return this.ticks;
  };

  yasp.Emulator.prototype.getTimePerTick = function () {
    return this.tickDelay / this.ticksPerTick;
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

      if(this.globalBreakpoints.length !== 0) {
        for (var i = 0; i < this.globalBreakpoints.length; i++) {
          var condition = this.globalBreakpoints[i];
          var shouldBreak = this.checkBreakpointCondition(condition);

          if(shouldBreak) {
            this.resetChangeBreakpointData();
            this.break("breakpoint");
            break;
          }
        }
      }

      if(this.breakpoints[this.pc] === true && this.skipBreakpoint === false) {
        var condition = this.breakpointConditions[this.pc];
        var shouldBreak = this.checkBreakpointCondition(condition);

        if(shouldBreak) {
          this.resetChangeBreakpointData();
          this.break("breakpoint");
          break;
        }
      }

      this.resetChangeBreakpointData();

      this.skipBreakpoint = false;

      if(typeof this.running === "number") {
        this.running--;

        if(this.running < 0) {
          this.break("count");
          break;
        }
      }

      if(this.waitTime !== 0) {
        if(this.running === 0 || this.forceStep === true) { // ignore WAIT/PAUSE when stepping or running in test-suite
          this.running = 1;
          this.setTickWrapperTimeout();
        } else {
          // don't set the normal timeout but wait for the desired time
          this.setTickWrapperTimeout(this.waitTime);
        }

        // fix the number of ticks executed. This has to be accurate since PWM relies on the tick-count
        // to calculate for how long a pin was high or low.
        var ticksSkipped = (this.waitTime / this.getTimePerTick());
        this.ticks += ticksSkipped;
        this.waitTime = 0;
        return;
      }

      // interrupts
      if(this.interruptToServe !== -1) {
        if(debug) console.log("interrupt jumped: " + this.interruptToServe);
        this.pushWord(this.pc); // for RETI
        this.pc = this.getInterruptAddress(this.interruptToServe);
        this.interruptToServe = -1;
        break;
      }

      this.tick();
    }

    this.setTickWrapperTimeout();
  };

  yasp.Emulator.prototype.resetChangeBreakpointData = function () {
    if(this.changeBreakpoints.rbyte === true)
      this.changeBreakpointData.rbyte.length = 0;
    if(this.changeBreakpoints.rword === true)
      this.changeBreakpointData.rword.length = 0;
    if(this.changeBreakpoints.zflag === true)
      this.changeBreakpointData.zflag.length = 0;
    if(this.changeBreakpoints.cflag === true)
      this.changeBreakpointData.cflag.length = 0;
    if(this.changeBreakpoints.io === true)
      this.changeBreakpointData.io.length = 0;
    if(this.changeBreakpoints.ram === true)
      this.changeBreakpointData.ram.length = 0;
    if(this.changeBreakpoints.rom === true)
      this.changeBreakpointData.rom.length = 0;
  };

  /** check if a conditional breakpoint should be triggered with the current state
   * @param cond {object} optimized breakpoint condition, see {@link yasp.Emulator#setBreakpoints}
   * @private
   */
  yasp.Emulator.prototype.checkBreakpointCondition = function (cond) {
    var actualBoolValue = false;
    var actualNumValue = 0;
    var actualUintArrayValue = null;

    // no checking needed if there is no condition..
    if(cond === null)
      return true;

    // ========================
    // check for changed values
    if(cond.isChange) {
      if(cond.isByteRegister)
        return this.changeBreakpointData.rbyte.indexOf(cond.registerNumber) !== -1;
      else if(cond.isWordRegister)
        return this.changeBreakpointData.rword.indexOf(cond.registerNumber) !== -1;
      else if(cond.isCarryFlag)
        return this.changeBreakpointData.cflag.length !== 0;
      else if(cond.isZeroFlag)
        return this.changeBreakpointData.zflag.length !== 0;
      else if(cond.isIO)
        return this.changeBreakpointData.io.indexOf(cond.ioPinNumber) !== -1;
      else if(cond.isRamOffset)
        return this.changeBreakpointData.ram.indexOf(cond.memoryOffset) !== -1;
      else if(cond.isRomOffset)
        return this.changeBreakpointData.rom.indexOf(cond.memoryOffset) !== -1;

      return false;
    }

    // ===================
    // read current values

    if(cond.isByteRegister) {
      actualNumValue = this.readByteRegister(cond.registerNumber);
    } else if(cond.isWordRegister) {
      actualNumValue = this.readWordRegister(cond.registerNumber);
    } else if(cond.isCarryFlag) {
      actualBoolValue = this.isCarryFlagSet();
    } else if(cond.isZeroFlag) {
      actualBoolValue = this.isZeroFlagSet();
    } else if(cond.isIO) {
      actualNumValue = this.getIO(cond.ioPinNumber);
    } else if(cond.isRamOffset) {
      if(cond.isUintArrayValue) {
        actualUintArrayValue = this.ram.subarray(cond.memoryOffset, cond.memoryOffset + cond.uintArrayValue.length);
      } else {
        actualNumValue = this.readRAM(cond.memoryOffset);
      }
    } else if(cond.isRomOffset) {
      if(cond.isUintArrayValue) {
        actualUintArrayValue = this.rom.subarray(cond.memoryOffset, cond.memoryOffset + cond.uintArrayValue.length);
      } else {
        actualNumValue = this.readROM(cond.memoryOffset);
      }
    }

    // ============
    // check values

    if(cond.isEquals) {
      if(cond.isNumValue)
        return (actualNumValue  === cond.numValue);
      else if(cond.isBoolValue)
        return (actualBoolValue === cond.boolValue);
      else if(cond.isUintArrayValue)
        return actualUintArrayValue.equals(cond.uintArrayValue);

    } else if(cond.isNotEquals) {
      if(cond.isNumValue)
        return (actualNumValue  !== cond.numValue);
      else if(cond.isBoolValue)
        return (actualBoolValue !== cond.boolValue);
      else if(cond.isUintArrayValue)
        return !actualUintArrayValue.equals(cond.uintArrayValue);

    } else if(cond.isSmaller && cond.isNumValue) {
      return (actualNumValue < cond.numValue);
    } else if(cond.isBigger && cond.isNumValue) {
      return (actualNumValue > cond.numValue);
    } else if(cond.isSmallerEquals && cond.isNumValue) {
      return (actualNumValue <= cond.numValue);
    } else if(cond.isBiggerEquals && cond.isNumValue) {
      return (actualNumValue >= cond.numValue);
    }

    console.log("Invalid condition: " + JSON.stringify(cond));
    return false;
  };

  /** Executes instructions. Do not call manually.
   * @private
   * @see {@link https://github.com/yasp/yasp/blob/master/doc/emulator/emulator.md#ticks|Additional documentation}
   */
  yasp.Emulator.prototype.tick = function () {
    this.ticks++;

    // fetch instruction
    if(this.commandCache[this.pc] === undefined) {
      var cmd = yasp.disasm.getCommand(this.rom, this.pc);

      if(cmd !== null) {
        cmd.boundExec = cmd.cmd.exec.bind(this);

        this.commandCache[this.pc] = cmd;

        var lastByte = this.pc + cmd.neededBytes;
        for (var i = this.pc + 1; i < lastByte; i++) {
          this.commandCache[i] = true;
        }
      }
    }

    var ccmd = this.commandCache[this.pc];
    if(ccmd === undefined) {
      this.break("invalid_instr");
      return;
    }
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
      ccmd.boundExec();
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
        ccmd.boundExec(p0);
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

        ccmd.boundExec(p0, p1);
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
