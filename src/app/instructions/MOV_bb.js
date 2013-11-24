{
  "name": "MOV",
  "doc": {
    "de": {
      "description": "Kopiert den Wert des zweiten Registers in das erste.",
      "flags": {
      }
    },
    "en": {
      "description": "Copies the value of the second register into the first one.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000000",
      "length": 6
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_byte"
    },
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte1, rbyte2) {
    this.writeByteRegister(rbyte1.address, rbyte2.value);
  }
}
