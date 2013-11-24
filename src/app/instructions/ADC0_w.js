{
  "name": "ADC0",
  "description": "",
  "code": [
    {
      "value": 0x90
    },
    {
      "value": "100",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.writeWordRegister(rword.address, this.getIO(10));
  }
}
