{
  "name": "INC",
  "doc": {
    "de": {
      "description": "Addiert 1 zum Wert des Registers. Wenn der Wert 0xFF ist, ist das Ergebnis 0x00.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn der Wert 0xFF war"
      }
    },
    "en": {
      "description": "Adds 1 to the value of the register. If the value is 0xFF, the result will be 0x00.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the value was 0xFF"
      }
    }
  },
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "000",
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
    var newVal = rbyte.value + 1;
    this.writeByteRegister(rbyte.address, newVal & 0xFF);
    this.writeFlags((newVal > 0xFF), null);
  }
}
