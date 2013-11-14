{
  "name": "POP",
  "description": "",
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "111",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function(rbyte) {
    this.writeByteRegister(rbyte.address, this.popByte());
  }
}
