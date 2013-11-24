{
  "name": "ADD",
  "doc": {
    "de": {
      "description": "Addiert die Werte der beiden Register.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis größer als 255 (ein Byte) ist"
      }
    },
    "en": {
      "description": "Adds the values of both registers.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 255 (one byte)"
      }
    }
  },
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000001",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte1, rbyte2) {
    var newVal = rbyte1.value + rbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
    this.writeFlags((newVal > 0xFF), null);
  }
}
