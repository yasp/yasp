if (typeof yasp == 'undefined') yasp = { };

(function () {
  /**
   * @namespace
   */
  yasp.bitutils = { };

  var bitmaps = buildBitmapMap ();

  /** takes a number of unsigned integers from an array of bytes. See the emulator-documentation for details.
   * @param bytes the source bytes
   * @param parts length of the parts to extract
   * @param retn array to store the result in, has to be of the same length as parts
   */
  yasp.bitutils.extractBits = function (bytes, parts, retn) {
    var pointer = 0; // bit-pointer in bytes

    for (var i = 0; i < parts.length; i++) {
      var l = parts[i]; // length of this part
      var valPointer = l; // bit-pointer in this parts result
      var val = 0; // result

      while (l > 0) {
        var pointerInByte = pointer % 8;
        var v;
        var ll = Math.min(l, 8 - pointerInByte); // number of bits to get from this byte

        v = yasp.bitutils.extractFromByte(bytes[Math.floor(pointer / 8)], pointerInByte, ll);
        valPointer -= ll;
        v = v << valPointer;
        val = val | v;

        l -= ll;
        pointer += ll;
      }

      retn[i] = val;
    }
  };

  /** takes one unsigned integer from a single byte. For example: (00100111b, 3dec, 4dec) => 0111b => 7dec
   * @param byte the byte to read the int from
   * @param p start of the int inside the byte
   * @param l length of the int
   * @private
   */
  yasp.bitutils.extractFromByte = function (byte, p, l) {
    if(l == 8)
      return byte;

    var map = bitmaps[l] >> p;
    var val = byte & map;
    val = val >> 8 - p - l;
    return val;
  }

  /** combines two bytes into one word
   * @param b1 the most significant byte
   * @param b2 the last significant byte
   */
  yasp.bitutils.wordFromBytes = function (b1, b2) {
    return b1 << 8 | b2;
  };

  /** splits a word into two bytes and writes the resulting two bytes into an existing array. The bytes are not returned as an array or object because allocations are expensive.
   * @param w the word to split
   * @param dest the destination array
   * @param destOffset the offset in the destination array, start of the two bytes
   */
  yasp.bitutils.bytesFromWord = function (w, dest, destOffset) {
    dest[destOffset] = w >> 8;
    dest[destOffset + 1] = w & 0xFF;
  };

  /** builds a bitmaps for `00000000b`, through `11110000b` to `11111111b`
   */
  function buildBitmapMap () {
    var maps = { };

    for (var i = 0; i < 8; i++) {
      var num = new Array(i + 1).join("1") + new Array(8 - i + 1).join("0");
      maps[i] = parseInt(num, 2);
    }

    return maps;
  }
})();

