if (typeof yasp == 'undefined') yasp = { };

(function() {
  var tickTimeout = 1;
  var ticksPerTick = 5;
  var debug = false;

  /**
   * Emulator is responsible for running the bytecode from the assembler
   * @constructor
   */
  yasp.Emulator = function(stepping) {
    this.rom = new Uint8Array(512);
    this.ram = new Uint8Array(512);

    this.stack = new Uint8Array(16);
    this.sp = -1;

    this.ticks = 0;

    this.waitTime = 0;

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

    this.pins = [
      undefined,
      {
        type: "gpio",
        state: false,
        mode: "in"
      },
      {
        type: "gpio",
        state: false,
        mode: "in"
      },
      // LEDs
      {
        type: "gpio",
        state: false,
        mode: "out"
      },
      {
        type: "gpio",
        state: false,
        mode: "out"
      },
      {
        type: "gpio",
        state: false,
        mode: "out"
      },
      undefined,
      undefined,
      undefined,
      undefined,
      // ADC0
      {
        type: "adc",
        state: 0,
        mode: "in"
      },
      // ADC1
      {
        type: "adc",
        state: 0,
        mode: "in"
      },
      // ADC2
      {
        type: "adc",
        state: 0,
        mode: "in"
      }
    ];

    this.pwmStatus = {};
    this.pwmTimeouts = {};

    this.pc = 0;
    this.running = false;
    this.stepping = !!stepping;
    this.flags = { c: false, z: false };

    this.commandCache = {};

    this.noop = function () {};
    this.events = {
      'CONTINUED': this.noop,
      'BREAK': this.noop,
      'LOADED': this.noop,
      'IO_CHANGED': this.noop
    };

    if(!stepping)
      setTimeout(this.tick.bind(this), tickTimeout);
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

    if(debug) console.log("b" + r + "=" + v);

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
    if(c !== null)
    {
      if(debug) console.log("c=" + c);
      this.flags.c = c;
    }
    if(z !== null)
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

    if(typeof s !== "number" || (s < 0 || s > 65535))
      return 3;
    if(pin === undefined)
      return 1;
    if(pin.mode === "in" && outside !== true)
      return 2;

    if(s === 1) {
      this.triggerInterrupt(p);
    }

    if(debug) console.log("p" + p + "=" + s);
    pin.state = s;

    if(outside !== true) {
      this.updatePwm(p, pin, s);
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
      } else if(!this.pwmStatus[p].timeOff) {
        this.events.IO_CHANGED(p, 1, pin.mode, pin.type);
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
    } else if(s === 0) {
      if(!this.pwmStatus[p]) {
        // ???
      } else {
        this.pwmStatus[p].timeOff = now;
      }
    }

    if(this.pwmTimeouts[p])
      clearTimeout(this.pwmTimeouts[p]);

    this.pwmTimeouts[p] = setTimeout(function () {
      this.events.IO_CHANGED(p, s, pin.mode, pin.type);
      this.pwmStatus[p] = null;
    }.bind(this), 100);
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
    this.waitTime = ms;
  };

  yasp.Emulator.prototype.tick = function () {
    if(this.running == false && !this.stepping) {
      setTimeout(this.tick.bind(this), tickTimeout);
      return;
    }

    for(var jj = 0; jj < ticksPerTick; jj++) {

    this.ticks++;

    if(this.waitTime !== 0) {
      setTimeout(this.tick.bind(this), this.waitTime);
      var timePerTick = tickTimeout / ticksPerTick;
      this.ticks += (this.waitTime / timePerTick);
      this.waitTime = 0;
      return;
    }

    if(this.interruptToServe !== -1) {
      this.pushWord(this.pc); // for RETI
      this.pc = this.getInterruptAddress(this.interruptToServe);
      this.interruptToServe = -1;
    }

    var ppc = this.pc;
    var neededBytes;
    var parts;
    var cmd;
    var params;

    var cachedCmd = this.commandCache[ppc];

    if(!cachedCmd) {
      parts = [ ];
      var bytes = [ this.rom[ppc++] ];

      for (var i = 0; i < yasp.commands.length; i++) {
        cmd = yasp.commands[i];
        parts.length = 0;

        for (var j = 0; j < cmd.code.length; j++) {
          if(typeof cmd.code[j].value == "string")
            parts.push(cmd.code[j].value.length);
          else if(!isNaN((+cmd.code[j].value)))
            parts.push(8);
        }

        for (var j = 0; j < cmd.params.length; j++) {
          var len = yasp.ParamType[cmd.params[j].type].len;
          parts.push(len);
        }

        neededBytes = 0;

        for (var j = 0; j < parts.length; j++) {
          neededBytes += parts[j];
        }
        neededBytes = ~~(neededBytes / 8);

        if(neededBytes > bytes.length) {
          for (var j = bytes.length; j < neededBytes; j++) {
            bytes.push(this.rom[ppc++]);
          }
        }

        yasp.bitutils.extractBits(bytes, parts, parts);

        var matches = true;

        for (var k = 0; k < cmd.code.length; k++) {
          var cc = cmd.code[k].value;
          if(typeof cc == "string")
            cc = parseInt(cc, 2);

          if(cc != parts[k])
          {
            matches = false;
            break;
          }
        }

        if(matches) {
          break;
        }

        cmd = null;
      }

      if(cmd == null) {
        throw "Invalid Instruction at " + this.pc;
      }

      params = [ ];

      for (var i = 0; i < cmd.params.length; i++) {
        var param = { type: cmd.params[i].type, value: null, address: null };
        var part = parts[cmd.code.length + i];

        param.valueNeeded = (cmd.params[i].valueNeeded !== false);

        switch (cmd.params[i].type) {
          case "r_byte":
            param.address = part;
            param.isRByte = true;
            break;
          case "r_word":
            param.address = part;
            param.isRWord = true;
            break;
          case "l_byte":
            param.value = part;
            param.address = null;
            param.valueNeeded = false;
            break;
          case "l_word":
            param.value = part;
            param.address = null;
            param.valueNeeded = false;
            break;
          case "pin":
            param.address = part;
            param.isPin = true;
            break;
          case "address":
            param.value = part;
            param.address = null;
            param.valueNeeded = false;
            break;
        }

        params.push(param);
      }

      this.commandCache[this.pc] = { cmd: cmd, neededBytes: neededBytes, params: params };
    } else {
      cmd = cachedCmd.cmd;
      neededBytes = cachedCmd.neededBytes;
      params = cachedCmd.params;
    }

    this.writePC(this.pc + neededBytes);

    var p0 = params[0];

    if(params.length === 0) {
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

      if(params.length === 2) {
        var p1 = params[1];
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
    }

    if(!this.stepping) {
      setTimeout(this.tick.bind(this), tickTimeout);
    }
  };
})();
