{
  "name": "MOV",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000000",
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
    this.writeByteRegister(rbyte1.address, rbyte2.value);
  }
}
