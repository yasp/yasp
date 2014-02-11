{
  "name": "ADC",
  "doc": {
    "de": {
      "description": "Liest einen analogen Wert von einem das Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Reads an analogue value from a pin into the given register.",
      "flags": {
      }
    }
  }, // b0, b1   b2, b3
  "tests": [
    {
      cmd: "ADC w1,10",
      setup: { reg: { "w1": 0xAAAA }, pin: { 10: 0xFA } },
      steps: { reg: { "b2": 0xAA, "b3": 0xFA } }
    },
    {
      cmd: "ADC w1,11",
      setup: { reg: { "w1": 0xAAAA }, pin: { 11: 0xFA } },
      steps: { reg: { "b2": 0xAA, "b3": 0xFA } }
    }
  ],
  "code": [
    {
      "value": 0x90
    },
    {
      "value": "111000",
      "length": 6
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_word"
    },
    {
      "type": "pin"
    }
  ],
  "exec": function (rword, pin) {
    this.writeByteRegister(rword.address * 2 + 1, pin.value);
  }
}
