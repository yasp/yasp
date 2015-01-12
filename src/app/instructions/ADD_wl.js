{
  "name": "ADD",
  "doc": {
    "de": {
      "description": "Addiert den Wert des Registers mit dem zweiten Parameter.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis größer als 65535 (ein word) ist"
      }
    },
    "en": {
      "description": "Adds the value of the register and the given literal value.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 65535 (one word)"
      }
    }
  },
  "tests": [
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0x02FA } },
      steps: { reg: { "w0": 0x02FB }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,2",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "001"
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
    var newVal = rword1.value + lword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
    this.writeFlags((newVal > 0xFFFF), null);
  }
}
