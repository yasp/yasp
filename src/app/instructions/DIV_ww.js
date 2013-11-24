{
  "name": "DIV",
  "doc": {
    "de": {
      "description": "Dividiert den Wert des ersten Registers durch das niederwertige Byte des zweiten Registers.",
      "flags": {
      }
    },
    "en": {
      "description": "Divides the value of the first Register with the least significant byte of the second register.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "011000",
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
    var newVal = ~~(rword1.value / (rword2.value & 0xFF));
    this.writeWordRegister(rword1.address, newVal);
  }
}
