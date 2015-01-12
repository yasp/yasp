{
  "name": "INV",
  "doc": {
    "de": {
      "description": "Berechnet das Einser-Kompliment des angegebenen registers.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist"
      }
    },
    "en": {
      "description": "Calculates the 1's complement of the specified register.",
      "flags": {
        "z": "is set if the result is 0"
      }
    }
  },
  "tests": [
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "00000000 00000001" } },
      steps: { reg: { "w0": "11111111 11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "11111111 11111111" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c:false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "010"
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte1) {
    var newVal = (~rbyte1.value) & 0xFFFF;
    this.writeWordRegister(rbyte1.address, newVal);
  }
}
