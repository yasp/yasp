{
  "name": "RDRAM",
  "doc": {
    "de": {
      "description": "Liest den Wert im RAM an der Adresse des Word-Registers in das Byte-Register.",
      "flags": {
        "c": "wird gesetzt wenn die Adresse außerhalb des RAMs liegt"
      }
    },
    "en": {
      "description": "Reads the value in RAM at the address of the word-register into the byte-register.",
      "flags": {
        "c": "is set if the address is outside the bounds of the RAM"
      }
    }
  },
  "tests": [
    {
      cmd: "RDRAM b2,w0",
      setup: { reg: { "w0": 0x03, "b3": 0xFA } },
      steps: { reg: { "b2": 0xFA } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000111"
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
    var val = this.readRAM(rword2.value);
    this.writeByteRegister(rbyte1.address, val);
  }
}
