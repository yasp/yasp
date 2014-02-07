{
  "name": "ADC0",
  "doc": {
    "de": {
      "description": "Liest einen analogen Wert von dem Pin 10 in das register.",
      "flags": {
      }
    },
    "en": {
      "description": "Reads an analogue value from pin 10 into the given register.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "ADC0 w1",
      setup: { pin: { 10: 0xFA } },
      steps: { reg: { "w1": 0x00FA } }
    }
  ],
  "code": [
    {
      "value": 0x90
    },
    {
      "value": "100",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.writeWordRegister(rword.address, this.getIO(10));
  }
}
