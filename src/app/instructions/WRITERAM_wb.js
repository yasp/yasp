{
  "name": "WRITERAM",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "001000",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rword1, rbyte2) {
    var rtn = this.writeRAM(rword1.value, rbyte2.value);
    this.writeFlags(rtn === 1, null);
  }
}
