{
  "name": "AND",
  "doc": {
    "de": {
      "description": "Wendet den binären UND-Operator auf den Wert des Registers und den zweiten Parameter an.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist"
      }
    },
    "en": {
      "description": "Calucates the binary AND of the value of the register and the even literal value.",
      "flags": {
        "z": "is set if the result is 0"
      }
    }
  },
  "tests": [
    {
      cmd: "AND w0,17346", //01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "01000001 10000010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND w0,514",   //00000010 00000010
      setup: { reg: { "w0": "00000100 00010000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "100"
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
    var newVal = rword1.value & lword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
  }
}
