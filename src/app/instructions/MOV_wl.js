{
  "name": "MOV",
  "doc": {
    "de": {
      "description": "Schreibt den gegebenen Wert in das Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Writes the given literal value into the register.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "000",
      "length": 3
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_word"
    },
    {
      "type": "l_word"
    }
  ],
  "exec": function (rword, lword) {
    this.writeWordRegister(rword.address, lword.value);
  }
}
