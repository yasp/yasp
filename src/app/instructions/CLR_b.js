{
  "name": "CLR",
  "doc": {
    "de": {
      "description": "Setzt den Wert des Registers auf 0x00.",
      "flags": {
      }
    },
    "en": {
      "description": "Sets the value of the register to 0x00",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "011",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte) {
    this.writeByteRegister(rbyte.address, 0);
    this.writeFlags(null, true);
  }
}
