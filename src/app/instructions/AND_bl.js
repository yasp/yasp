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
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "100",
      "length": 3
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
