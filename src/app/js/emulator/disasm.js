if (typeof yasp == 'undefined') yasp = { };

(function () {
  yasp.disasm = {};

  yasp.disasm.getCommands = function (bytes, offset, length) {
  };

  yasp.disasm.getCommand = function (rom, offset) {
    var parts = [ ];
    var ppc = offset;
    var bytes = [ rom[ppc++] ];

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
          bytes.push(rom[ppc++]);
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

    if(cmd === null) {
      return null;
    }

    var params = [ ];

    var debugStr = "";

    if(cmd.name instanceof Array) {
      debugStr = cmd.name[0];
    } else {
      debugStr = cmd.name;
    }

    debugStr += " ";

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

    debugStr = debugStr.substr(0, debugStr.length - 2);

    return { cmd: cmd, str: debugStr, neededBytes: neededBytes, params: params };
  };
})();