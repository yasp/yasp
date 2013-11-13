{
  "name": "CMP",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010011",
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
    var zero = rword1.value === rword2.value;
    var carry = rword1.value < rword2.value;
    this.writeFlags(carry, zero);
  }
}
