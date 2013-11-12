{
  "name": "DEC",
  "description": "",
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword) {
    var newVal = rword.value - 1;
    this.writeWordRegister(rword.address, newVal & 0xFFFF);
    this.writeFlags((newVal < 0), null);
  }
}
