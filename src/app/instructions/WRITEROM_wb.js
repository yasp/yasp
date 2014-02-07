{
  "name": "WRROM",
  "doc": {
    "de": {
      "description": "Schreibt den Wert des Byte-Registers in den ROM an die Adresse des Word-Registers.",
      "flags": {
        "c": "wird gesetzt wenn die Adresse außerhalb des RAMs liegt"
      }
    },
    "en": {
      "description": "Writes the value of the byte-register into the ROM at the address of the word-register.",
      "flags": {
        "c": "is set if the address is outside the bounds of the RAM"
      }
    }
  },
  "tests": [
    {
      cmd: "WRROM w0,b2",
      setup: { reg: { "w0": 0xFF, "b2": 0xFA } },
      steps: { rom: { 0xFF: 0xFA } }
    },
    {
      cmd: "WRROM w0,b2",
      setup: { rom: new Array(160), reg: { "w0": 0xFFFF, "b2": 0xFA } },
      steps: { flags: { "c": true, "z": false } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "011010",
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
    var rtn = this.writeROM(rword1.value, rbyte2.value);
    this.writeFlags(rtn === 1, null);
  }
}
