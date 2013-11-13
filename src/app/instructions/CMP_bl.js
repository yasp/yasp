{
  "name": "CMP",
  "description": "",
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "011",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "l_byte"
    }
  ],
  "exec": function (rbyte1, lbyte2) {
    var zero = rbyte1.value === lbyte2.value;
    var carry = rbyte1.value < lbyte2.value;
    this.writeFlags(carry, zero);
  }
}
