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
  "tests": [
    {
      cmd: "POT 10,w0",
      setup: { pin: { 10: 0xFF } },
      steps: { reg: { "w0": 0x00FF } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "100110"
    }
  ],
  "params": [
    {
      "type": "pin"
    },
    {
      "valueNeeded": false,
      "type": "r_word"
    }
  ],
  "exec": function (pin, rword) {
    this.writeWordRegister(rword.address, pin.value);
  }
}
