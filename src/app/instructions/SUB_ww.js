{
  "name": "SUB",
  "doc": {
    "de": {
      "description": "Subtrahiert den Wert des zweiten Registers von dem des ersten.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis kleiner als 0 ist"
      }
    },
    "en": {
      "description": "Subtracts the value of the second register from the first one.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result smaller than 0"
      }
    }
  },
  "tests": [
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0xFF00, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0F01, "w1": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010010",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword1, rword2) {
    var newVal = rword1.value - rword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
    this.writeFlags((newVal < 0), null);
  }
}
