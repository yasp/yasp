{
  "name": "MOV",
  "doc": {
    "de": {
      "description": "Kopiert den Wert des zweiten Registers in das erste.",
      "flags": {
      }
    },
    "en": {
      "description": "Copies the value of the second register into the first one.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "MOV w0,w1",
      setup: { reg: { "w1": 0xFFAA } },
      steps: { reg: { "w0": 0xFFAA } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010000",
      "length": 6
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword1, rword2) {
    this.writeWordRegister(rword1.address, rword2.value);
  }
}
