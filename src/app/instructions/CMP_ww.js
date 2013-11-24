{
  "name": "CMP",
  "doc": {
    "de": {
      "description": "Vergleicht zwei Werte.",
      "flags": {
        "z": "wird gesetzt wenn die Werte gleich sind",
        "c": "wird gesetzt wenn der zweite Wert größer ist als der erste.",
      }
    },
    "en": {
      "description": "Compares two values.",
      "flags": {
        "z": "is set if the values are equal",
        "c": "is set if the second value is greater than the first value",
      }
    }
  },
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
