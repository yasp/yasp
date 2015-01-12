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
  "tests": [
    {
      cmd: "XOR b0,67", //   01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "00010110" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR b0,3",
      setup: { reg: { "b0": "00000011" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "110"
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "l_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte1, lbyte2) {
    var newVal = rbyte1.value ^ lbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
  }
}
