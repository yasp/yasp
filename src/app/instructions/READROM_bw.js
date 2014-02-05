{
  "name": "RDROM",
  "doc": {
    "de": {
      "description": "Liest den Wert im ROM an der Adresse des Word-Registers in das Byte-Register.",
      "flags": {
        "c": "wird gesetzt wenn die Adresse außerhalb des RAMs liegt"
      }
    },
    "en": {
      "description": "Reads the value in ROM at the address of the word-register into the byte-register.",
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
      "value": "011001",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_word"
    }
  ],
  "exec": function (rbyte1, rword2) {
    var val = this.readROM(rword2.value);
    this.writeByteRegister(rbyte1.address, val);
  }
}
