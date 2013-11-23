{
  "name": ["DELAY", "PAUSE"],
  "description": "",
  "code": [
    {
      "value": 0x30
    },
    {
      "value": "01100000",
      "length": 8
    }
  ],
  "params": [
    {
      "type": "l_word"
    }
  ],
  "exec": function (lword) {
    this.wait(lword.value);
  }
}
