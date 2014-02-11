{
  "name": "ADC2",
  "doc": {
    "de": {
      "description": "Liest einen analogen Wert von dem Pin 12 in das register.",
      "flags": {
      }
    },
    "en": {
      "description": "Reads an analogue value from pin 12 into the given register.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "ADC2 w1",
      setup: { reg: { "w1": 0xAAAA }, pin: { 12: 0xFA } },
      steps: { reg: { "b2": 0xAA, "b3": 0xFA } }
    }
  ],
  "code": [
    {
      "value": 0x90
    },
    {
      "value": "110",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
  this.writeByteRegister(rword.address * 2 + 1, this.getIO(12));
  }
}
