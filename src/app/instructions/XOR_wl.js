{
  "name": "XOR",
  "doc": {
    "de": {
      "description": "Wendet den binären Exklusiv-Oder-Operator auf den Wert des Registers und den zweiten Parameter an.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist"
      }
    },
    "en": {
      "description": "Calucates the binary exclusive-or of the value of the register and the given literal value.",
      "flags": {
        "z": "is set if the result is 0"
      }
    }
  },
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "110",
      "length": 3
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
    var newVal = rword1.value ^ lword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
  }
}
