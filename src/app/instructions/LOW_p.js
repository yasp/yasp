{
  "name": "LOW",
  "doc": {
    "de": {
      "description": "Setzt den Pin auf den low- bzw. aus-Zustand.",
      "flags": {
      }
    },
    "en": {
      "description": "Puts the pin into the low- or off-state.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "001",
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
    this.setIO(pin.address, 0);
  }
}
