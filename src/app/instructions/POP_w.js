{
  "name": "POP",
  "description": "",
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "111",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function(rword) {
    this.writeWordRegister(rword.address, this.popWord());
  }
}
