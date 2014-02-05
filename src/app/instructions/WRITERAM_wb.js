{
  "name": "WRRAM",
  "doc": {
    "de": {
      "description": "Schreibt den Wert des Byte-Registers in den RAM an die adresse des Word-Registers.",
      "flags": {
        "c": "wird gesetzt wenn die Adresse außerhalb des RAMs liegt"
      }
    },
    "en": {
      "description": "Writes the value of the byte-register into the RAM at the address of the word-register.",
      "flags": {
        "c": "is set if the address is outside the bounds of the RAM"
      }
    }
  },
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "001000",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rword1, rbyte2) {
    var rtn = this.writeRAM(rword1.value, rbyte2.value);
    this.writeFlags(rtn === 1, null);
  }
}
