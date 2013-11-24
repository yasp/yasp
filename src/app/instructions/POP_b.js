{
  "name": "POP",
  "doc": {
    "de": {
      "description": "Nimmt das oberste Byte von dem Stack und schreibt es in das Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Takes the top byte from the stack and writes it into the register",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "111",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function(rbyte) {
    this.writeByteRegister(rbyte.address, this.popByte());
  }
}
