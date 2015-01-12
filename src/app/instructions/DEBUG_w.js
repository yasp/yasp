{
  "name": "DEBUG",
  "doc": {
  "de": {
    "description": "Sendet den Wert eines Word-Registers zum Debugger.",
      "flags": {
    }
  },
  "en": {
    "description": "Sends the value of a word register to the debugger.",
      "flags": {
    }
  }
},
  "tests": [
    {
      cmd: "DEBUG w1",
      setup: { reg: { "w1": 0x0102 } },
      steps: { debug: { "addr": 1, "subtype": "w", "type": "register", "val": 0x0102 } }
    }
  ],
  "code": [
    {
      "value": 0x70
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
  "exec": function (rword) {
    this.debugRegister('w', rword.address);
  }
}
