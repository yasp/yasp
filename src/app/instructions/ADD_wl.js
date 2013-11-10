{
  "name": "ADD",
  "description": "",
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "l_word"
    }
  ],
  "checkFlags": { "z": true, "c": true },
  "exec": function (rword1, lword2) {
    var newVal = (rword1.value + lword2.value) & 0xFFFF;
    this.writeWordRegister(rword1.address, newVal);
  }
}
