{
  "name": "AND",
  "doc": {
    "de": {
      "description": "Wendet den binären UND-Operator auf die Werte der Register an.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist"
      }
    },
    "en": {
      "description": "Calucates the binary AND of the values of both registers.",
      "flags": {
        "z": "is set if the result is 0"
      }
    }
  },
  "tests": [
    {
      cmd: "AND w0,w1",
      setup: { reg: { "w0": "01010101 10101010", "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "01000001 10000010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND w0,w1",
      setup: { reg: { "w0": "00100000 00000100", "w1": "10000000 00000001" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010100",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword1, rword2) {
    var newVal = rword1.value & rword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
  }
}
