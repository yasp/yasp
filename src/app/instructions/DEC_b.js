{
  "name": "DEC",
  "doc": {
    "de": {
      "description": "Zieht 1 vom Wert des Registers ab. Wenn der Wert 0x00 ist, ist das Ergebnis 0xFF.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn der Wert 0 war"
      }
    },
    "en": {
      "description": "Substracts one from the value of the register. If the value is 0x00 the result will be 0xFF.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the value was 0"
      }
    }
  },
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte) {
    var newVal = rbyte.value - 1;
    this.writeByteRegister(rbyte.address, newVal & 0xFF);
    this.writeFlags((newVal < 0), null);
  }
}
