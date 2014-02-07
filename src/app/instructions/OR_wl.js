{
  "name": "OR",
  "doc": {
    "de": {
      "description": "Wendet den binären ODER-Operator auf den Wert des Registers und den zweiten Parameter an.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist"
      }
    },
    "en": {
      "description": "Calucates the binary OR of the value of the register and the even literal value.",
      "flags": {
        "z": "is set if the result is 0"
      }
    }
  },
  "tests": [
    {
      cmd: "OR w0,17346", // 01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "01010111 11101010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR w0,0",
      setup: { reg: { "w0": "00000000 00000000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "101",
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
    var newVal = rword1.value | lword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
  }
}
