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
      cmd: "AND b0,67",   // 01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "01000001" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND b0,1",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "100"
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
    var newVal = rbyte1.value & lbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
  }
}
