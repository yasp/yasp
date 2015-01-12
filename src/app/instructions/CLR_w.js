{
  "name": "CLR",
  "doc": {
    "de": {
      "description": "Setzt den Wert des Registers auf 0x0000.",
      "flags": {
      }
    },
    "en": {
      "description": "Sets the value of the register to 0x0000",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "CLR w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0 }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "011"
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.writeWordRegister(rword.address, 0);
    this.writeFlags(null, true);
  }
}
