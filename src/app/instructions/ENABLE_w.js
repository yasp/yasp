{
  "name": "ENABLE",
  "description": "",
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "11100001",
      "length": 8
    }
  ],
  "params": [
    {
      "type": "l_byte"
    }
  ],
  "exec": function (lbyte) {
    this.setInterruptMask(lbyte.value);
  }
}
