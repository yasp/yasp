{
  "name": "RANDOM",
  "description": "",
  "code": [
    {
      "value": 0x50
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte) {
    this.writeByteRegister(rbyte.address, Math.random() * 255 & 0xFF);
  }
}
