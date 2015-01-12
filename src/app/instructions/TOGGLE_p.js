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
  "tests": [
    {
      cmd: "TOGGLE 3",
      setup: { pin: { 3: 1 } },
      steps: { pin: { 3: 0 } }
    },
    {
      cmd: "TOGGLE 3",
      setup: { pin: { 3: 0 } },
      steps: { pin: { 3: 1 } }
    }
  ],
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "010"
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
