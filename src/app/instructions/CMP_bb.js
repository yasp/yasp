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
      "value": "000011",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte1, rbyte2) {
    var zero = rbyte1.value === rbyte2.value;
    var carry = rbyte1.value < rbyte2.value;
    this.writeFlags(carry, zero);
  }
}
