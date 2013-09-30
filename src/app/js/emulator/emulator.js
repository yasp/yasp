if (typeof yasp == 'undefined') yasp = { };

(function() {
  var tickTimeout = 1000;
  var commandMap = { };

  /**
   * Emulator is responsible for running the bytecode from the assembler
   * @constructor
   */
  yasp.Emulator = function() {
    this.rom = new Uint8Array(512);
    this.ram = new Uint8Array(512);

    this.pc = 0;
    this.running = false;
    this.stepping = false;

    buildCommandMap();

  //  setTimeout(this.tick.bind(this), tickTimeout);
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
    }
    else if(!isNaN(+count)) {
      if(count < 0)
        return 0;
      this.running = +count;
    }
    else {
      return 2;
    }

    return true;
  };

  /**
   * @function Stops the execution
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.break = function () {
    if(this.running == false) {
      return 0;
    }

    this.running = false;

    return true;
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
    this.rom[r] = v;
    return true;
  };

  /**
   * @function Reads the given value at the given byte
   * @param r the byte-register to read
   * @returns {Number}
   */
  yasp.Emulator.prototype.readByteRegister = function (r) {
    if(r < 0 || r > 32)
      return -1;
    return this.rom[r];
  };

  yasp.Emulator.prototype.tick = function () {
    if(this.running == false) {
     // setTimeout(this.tick.bind(this), tickTimeout);
      return;
    }

    var ppc = this.pc;
    var bytes = [ this.rom[ppc++] ];
    var parts = [ ];
    var cmd;

    for (var i = 0; i < yasp.commands.length; i++) {
      var cmd = yasp.commands[i];
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

      var neededBytes = 0;
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
      console.log("==");

      var matches = true;

      for (var k = 0; k < cmd.code.length; k++) {
        var cc = cmd.code[k].value;
        if(typeof cc == "string")
          cc = parseInt(cc, 2);

        console.log(cc, parts[k]);

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
      throw "asd";
    }

    var params = [ ];

    for (var i = 0; i < cmd.params.length; i++) {
      var param = { value: null, address: null };
      var part = parts[cmd.code.length + i];

      switch (cmd.params[i].type) {
        case "r_byte":
          param.value = this.readByteRegister(part);
          param.address = part;
          break;
        case "r_word":
          param.value = 0; // TODO
          param.address = part;
          break;
        case "l_byte":
          param.value = part;
          param.address = null;
          break;
        case "l_word":
          param.value = part;
          param.address = null;
          break;
        case "pin":
          param.value = part;
          param.address = null;
          break;
        case "address":
          param.value = part;
          param.address = null;
          break;
      }

      params.push(param);
    }

    console.log(cmd, params);

    if(!this.stepping) {
    //  setTimeout(this.tick.bind(this), tickTimeout);
    }
  };

  function buildCommandMap() {
    commandMap = { };

    if(!yasp.commands || !yasp.commands.length)
      return;

    for (var i = 0; i < yasp.commands.length; i++) {
      var cmd = yasp.commands[i];
      var code = cmd.code[0].value;

      if(!(commandMap[code] instanceof Array))
        commandMap[code] = [ ];

      commandMap[code].push(cmd);
    }
  }

})();
