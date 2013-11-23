{
  "name": ["DELAY", "PAUSE"],
  "description": "",
  "code": [
    {
      "value": 0x70
    },
    {
      "value": "010",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.wait(rword.value);
  }
}
