{
  "name": "RR",
  "description": "This instruction shifts the bytes in the byte register by 1 bit to the right. The carry bit is set according to the lowest significant bit.",
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "100",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte1) {
    var newVal = (rbyte1.value >> 1) & 0xFF;
    var flags = { c: true, z: !!(newVal &  1)}; // bitmask newVal & 00000001b, to get LSB

    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(flags);
  }
}
