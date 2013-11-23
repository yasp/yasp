{
  "name": "JMPI",
  "description": "",
  "code": [
    {
      "value": 0x70
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
  "exec": function(rword) {
    this.writePC(rword.value);
  }
}
