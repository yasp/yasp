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
  },
  "tests": [
    {
      cmd: "ADC w1,10",
      setup: { pin: { 10: 0xFA } },
      steps: { reg: { "w1": 0x00FA } }
    },
    {
      cmd: "ADC w1,11",
      setup: { pin: { 11: 0xFA } },
      steps: { reg: { "w1": 0x00FA } }
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
    this.writeWordRegister(rword.address, pin.value);
  }
}
