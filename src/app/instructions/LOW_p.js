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
  "tests": [
    {
      cmd: "LOW 3",
      setup: { pin: { 3: true } },
      steps: { pin: { 3: 0 } }
    }
  ],
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "001"
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
