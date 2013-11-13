{
  "name": "CMP",
  "description": "",
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "011",
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
  "exec": function (rword1, lword2) {
    var zero = rword1.value === lword2.value;
    var carry = rword1.value < lword2.value;
    this.writeFlags(carry, zero);
  }
}
