{
  "name": "PUSH",
  "doc": {
    "de": {
      "description": "Pusht ein byte auf den Stack.",
      "flags": {
      }
    },
    "en": {
      "description": "Pushes one byte onto the stack.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "110",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function(rbyte) {
    this.pushByte(rbyte.value);
  }
}
