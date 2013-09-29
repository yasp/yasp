var bitutils = { };

(function () {
  var bitmaps = buildBitmapMap ();
  var bitCache = {};

  bitutils.extractBits = function (bytes, parts) {
    var pointer = 0;
    var retn = [ ];

    for (var i = 0; i < parts.length; i++) {
      var ol = parts[i];
      var l = ol;
      var valPointer = l;
      var val = 0;

      while (l > 0) {
        var pointerInByte = pointer % 8;
        var v;
        var ll;

        if(Math.floor((pointer + l) / 8) == Math.floor(pointer / 8)) {
          ll = l;
        } else {
          ll = 8 - pointerInByte;
        }

        v = extractFromByte(bytes[Math.floor(pointer / 8)], pointerInByte, ll);
        valPointer -= ll;
        v = v << valPointer;
        val = val | v;

        l -= ll;
        pointer += ll;
      }

      retn.push(val);
    }

    return retn;
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
})();

