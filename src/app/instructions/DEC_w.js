{
  "name": "DEC",
  "doc": {
    "de": {
      "description": "Zieht 1 vom Wert des Registers ab. Wenn der Wert 0x00 ist, ist das Ergebnis 0xFFFF.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn der Wert 0 war"
      }
    },
    "en": {
      "description": "Substracts one from the value of the register. If the value is 0x00 the result will be 0xFFFF.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the value was 0"
      }
    }
  },
  "tests": [
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    },
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "001"
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword) {
    var newVal = rword.value - 1;
    this.writeWordRegister(rword.address, newVal & 0xFFFF);
    this.writeFlags((newVal < 0), null);
  }
}
