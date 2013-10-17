{
  "name": "RR",
  "description": "This instruction shifts the bytes in the word register by 1 bit to the right. The carry bit is set according to the lowest significant bit.",
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "100",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rbyte1) {
    var newVal = (rbyte1.value >> 1) & 0xFFFF;
    var flags = { c: true, z: !!(newVal &  1)}; // bitmask newVal & 00000001b, to get LSB

    this.writeWordRegister(rbyte1.address, newVal);
    this.writeFlags(flags);
  }
}
