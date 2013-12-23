{
  "name": "TOGGLE",
  "doc": {
    "de": {
      "description": "Invertiert den digitalen Wert eines Ausgangs-Pins.",
      "flags": {
      }
    },
    "en": {
      "description": "Inverts the digital value of an output-pin.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "010",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.setIO(pin.address, pin.value === 1 ? 0 : 1);
  }
}
