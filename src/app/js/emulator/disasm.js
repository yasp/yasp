if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @class
   */
  yasp.disasm = {};

  /** disassembles one command
   * @param rom the array to read from
   * @param offset offset to start reading
   */
  yasp.disasm.getCommand = function (rom, offset) {
    var parts = [ ];

    for (var i = 0; i < yasp.commands.length; i++) {
      var cmd = yasp.commands[i];
      var neededBytes = 0;
      parts.length = 0; // reuse parts array

      // collect parts and sum up their length
      for (var j = 0; j < cmd.code.length; j++) {
        var part = 0;

        if(typeof cmd.code[j].value === "string") {
          // literal binary value, eg: "00011"
          part = cmd.code[j].value.length;
        } else if(isNaN(cmd.code[j].value) === false) {
          // literal byte value, eg: 0x10
          part = 8;
        }

        neededBytes += part;
        parts.push(part);
      }

      for (var j = 0; j < cmd.params.length; j++) {
        var len = yasp.ParamType[cmd.params[j].type].len;
        neededBytes += len;
        parts.push(len);
      }

      // convert to from number of bits to bytes
      neededBytes = Math.floor(neededBytes / 8);

      // parse needed parts from ROM
      yasp.bitutils.extractBits(rom, parts, parts, offset);

      // check if the code of the current command matches our parts
      var matches = true;

      for (var k = 0; k < cmd.code.length; k++) {
        var cc = cmd.code[k].value;

        if(typeof cc === "string") {
          cc = parseInt(cc, 2);
        }

        if(cc !== parts[k]) {
          matches = false;
          break;
        }
      }

      if(matches) {
        break;
      } else {
        cmd = null;
      }
    }

    // no command found
    if(cmd === null) {
      return null;
    }

    var params = [ ];

    var debugStr = "";

    if(cmd.name instanceof Array) {
      debugStr = cmd.name[0] + " ";
    } else {
      debugStr = cmd.name + " ";
    }

    for (var i = 0; i < cmd.params.length; i++) {
      var param = { type: cmd.params[i].type, value: null, address: null };
      var part = parts[cmd.code.length + i];

      param.valueNeeded = (cmd.params[i].valueNeeded !== false);

      switch (cmd.params[i].type) {
        case "r_byte":
          param.address = part;
          param.isRByte = true;
          debugStr += "b" + part;
          break;
        case "r_word":
          param.address = part;
          param.isRWord = true;
          debugStr += "w" + part;
          break;
        case "l_byte":
          param.value = part;
          param.address = null;
          param.valueNeeded = false;
          debugStr += part;
          break;
        case "l_word":
          param.value = part;
          param.address = null;
          param.valueNeeded = false;
          debugStr += part;
          break;
        case "pin":
          param.address = part;
          param.isPin = true;
          debugStr += part;
          break;
        case "address":
          param.value = part;
          param.address = null;
          param.valueNeeded = false;
          debugStr += "0x" + part.toString(16);
          break;
      }

      params.push(param);
      debugStr += ", ";
    }

    // remove last comma+space
    debugStr = debugStr.substr(0, debugStr.length - 2);

    return {
      cmd: cmd,
      str: debugStr,
      neededBytes: neededBytes,
      params: params
    };
  };
})();