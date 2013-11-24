{
  "name": "ADC1",
  "doc": {
    "de": {
      "description": "Liest einen analogen Wert von dem Pin 11 in das register.",
      "flags": {
      }
    },
    "en": {
      "description": "Reads an analogue value from pin 11 into the given register.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x90
    },
    {
      "value": "101",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.writeWordRegister(rword.address, this.getIO(11));
  }
}