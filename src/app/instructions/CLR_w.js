{
  "name": "CLR",
  "description": "",
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "011",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.writeWordRegister(rword.address, 0);
    this.writeFlags(null, true);
  }
}
