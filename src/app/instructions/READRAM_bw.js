{
  "name": "READRAM",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000111",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_word"
    }
  ],
  "exec": function (rbyte1, rword2) {
    var val = this.readRAM(rword2.value);
    this.writeByteRegister(rbyte1.address, val);
  }
}
