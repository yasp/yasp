{
  "name": "MOV",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010000",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword1, rword2) {
    this.writeWordRegister(rword1.address, rword2.value);
  }
}
