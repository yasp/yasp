{
  "name": "HIGH",
  "doc": {
    "de": {
      "description": "Setzt den Pin auf den high- bzw. an-Zustand.",
      "flags": {
      }
    },
    "en": {
      "description": "Puts the pin into the high- or on-state.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "000",
      "length": 3
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.setIO(pin.address, 1);
  }
}
