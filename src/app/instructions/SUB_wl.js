{
  "name": "SUB",
  "doc": {
    "de": {
      "description": "Subtrahiert den gegebenen Wert von dem Wert des Registers.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis kleiner als 0 ist"
      }
    },
    "en": {
      "description": "Subtracts the given value from the value of the first register.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result smaller than 0"
      }
    }
  },
  "tests": [
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,0x0F01",
      setup: { reg: { "w0": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "010"
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "l_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword1, lword2) {
    var newVal = rword1.value - lword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
    this.writeFlags((newVal < 0), null);
  }
}
