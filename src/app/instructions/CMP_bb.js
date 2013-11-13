{
  "name": "CMP",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000011",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte1, rbyte2) {
    var zero = rbyte1.value === rbyte2.value;
    var carry = rbyte1.value < rbyte2.value;
    this.writeFlags(carry, zero);
  }
}
