if (typeof yasp === "undefed") yasp = { };
if (!yasp.Debugger) yasp.Debugger = { };

(function () {
  var ramrom = {};
  yasp.Debugger.ramrom = ramrom;

  ramrom.onInit = function () {
  };

  ramrom.onOpen = function () {
    yasp.Debugger.lastRom = null;
    yasp.Debugger.lastRam = null;
  };

  ramrom.onState = function (state) {
    renderBytes(state.ram, 0x10, $('#debugger-ramdump'));
    if(yasp.Debugger.lastRam)
      colorChangedBytes(getChangedBytes(state.ram, yasp.Debugger.lastRam), $('#debugger-ramdump'));
    yasp.Debugger.lastRam = state.ram;

    renderBytes(state.rom, 0x10, $('#debugger-romdump'));
    if(yasp.Debugger.lastRom)
      colorChangedBytes(getChangedBytes(state.rom, yasp.Debugger.lastRom), $('#debugger-romdump'));
    yasp.Debugger.lastRom = state.rom;
  };


  function renderBytes (bytes, width, $container) {
    var $bytes = null;
    var inRow = 0;

    $container.empty();

    for(var i = 0; i < bytes.length; i++) {
      if(inRow === width || $bytes === null) {
        var $row = $('<div class="byterow">');
        $row.append($('<div class="offset">').text("0x" + yasp.Debugger.formatHexNumber(i, 4)));
        $bytes = $('<div class="bytes">');
        $row.append($bytes);
        $container.append($row);

        inRow = 0;
      }

      var byte = yasp.Debugger.formatHexNumber(bytes[i], 2);
      var $byte = $('<div class="byte">');
      $byte.text(byte);
      $byte.attr("data-offset", i);
      $bytes.append($byte);

      inRow++;
    }
  }

  function getChangedBytes (dump1, dump2) {
    var changed = [];
    for (var i = 0; i < dump1.length; i++) {
      if(dump1[i] !== dump2[i])
        changed.push(i);
    }
    return changed;
  }

  function colorChangedBytes (changed, $container) {
    for (var i = 0; i < changed.length; i++) {
      $container.find('.byte[data-offset="' + changed[i] + '"]').css('color', 'red');
    }
  }
})();