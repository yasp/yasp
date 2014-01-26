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
  "code": [
    {
      "value": 0x70
    },
    {
      "value": "000",
      "length": 3
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
