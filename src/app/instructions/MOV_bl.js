{
  "name": "MOV",
  "doc": {
    "de": {
      "description": "Schreibt den gegebenen Wert in das Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Writes the given literal value into the register.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0
    },
    {
      "value": "000",
      "length": 3
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_byte"
    },
    {
      "type": "l_byte"
    }
  ],
  "exec": function (rbyte, lbyte) {
    this.writeByteRegister(rbyte.address, lbyte.value);
  }
}
