{
  "name": "POT",
  "doc": {
    "de": {
      "description": "Liest einen analogen Wert von dem gegebenen Pin.",
      "flags": {
      }
    },
    "en": {
      "description": "Reads an analogue value from the given pin.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "100110",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "pin"
    },
    {
      "type": "r_word"
    }
  ],
  "exec": function (pin, rword) {
    this.writeWordRegister(rword.address, pin.value);
  }
}
