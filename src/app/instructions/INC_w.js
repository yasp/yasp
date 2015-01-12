{
  "name": "INC",
  "doc": {
    "de": {
      "description": "Addiert 1 zum Wert des Registers. Wenn der Wert 0xFFFF ist, ist das Ergebnis 0x00.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn der Wert 0xFFFF war"
      }
    },
    "en": {
      "description": "Adds 1 to the value of the register. If the value is 0xFFFF, the result will be 0x00.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the value was 0xFFFF"
      }
    }
  },
  "tests": [
    {
      cmd: "INC w0",
      setup: { reg: { "w0": 0x0FFF } },
      steps: { reg: { "w0": 0x1000 }, flags: { c: false, z: false } }
    },
    {
      cmd: "INC w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "000"
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword) {
    var newVal = rword.value + 1;
    this.writeWordRegister(rword.address, newVal & 0xFFFF);
    this.writeFlags((newVal > 0xFFFF), null);
  }
}
