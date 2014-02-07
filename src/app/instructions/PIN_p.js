{
  "name": "PIN",
  "doc": {
    "de": {
      "description": "Liest einen digitalen Wert von dem gegebenen Pin. low/aus z=1; high/an z=0",
      "flags": {
        "z": ""
      }
    },
    "en": {
      "description": "Reads a digital value from the given pin. low/off z=1; high/on z=0",
      "flags": {
        "z": ""
      }
    }
  },
  "tests": [
    {
      cmd: "PIN 3",
      setup: { pin: { 3: 1 } },
      steps: { flags: { z: false, c: false } }
    },
    {
      cmd: "PIN 3",
      setup: { pin: { 3: 0 } },
      steps: [
        { flags: { z: true, c: false } }
      ]
    }
  ],
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "101",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.writeFlags(null, !pin.value);
  }
}
