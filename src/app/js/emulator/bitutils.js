if (typeof yasp == 'undefined') yasp = { };

(function () {
  yasp.bitutils = { };

  var bitmaps = buildBitmapMap ();

  yasp.bitutils.extractBits = function (bytes, parts, retn) {
    var pointer = 0;

    for (var i = 0; i < parts.length; i++) {
      var l = parts[i];
      var valPointer = l;
      var val = 0;

      while (l > 0) {
        var pointerInByte = pointer % 8;
        var v;
        var ll = Math.min(l, 8 - pointerInByte);

        v = extractFromByte(bytes[Math.floor(pointer / 8)], pointerInByte, ll);
        valPointer -= ll;
        v = v << valPointer;
        val = val | v;

        l -= ll;
        pointer += ll;
      }

      retn[i] = val;
    }
  };

  function extractFromByte (byte, p, l) {
    if(l == 8)
      return byte;

    var map = bitmaps[l] >> p;
    var val = byte & map;
    val = val >> 8 - p - l;
    return val;
  }

  function buildBitmapMap () {
    var maps = { };

    for (var i = 0; i < 8; i++) {
      var num = new Array(i + 1).join("1") + new Array(8 - i + 1).join("0");
      maps[i] = parseInt(num, 2);
    }

    return maps;
  }

  function toBinaryString (i) {
    var str = i.toString(2);
    str = pad(str, "8");
    return str;

    function pad(n, width) {
      return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
    }
  }
})();

