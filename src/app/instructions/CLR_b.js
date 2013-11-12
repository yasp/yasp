{
  "name": "CLR",
  "description": "",
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "011",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte) {
    this.writeByteRegister(rbyte.address, 0);
    this.writeFlags(null, true);
  }
}
