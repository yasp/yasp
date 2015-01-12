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
  "tests": [
    {
      cmd: "POP b0",
      setup: { reg: { "sp": 1 }, stack: [0xFA] },
      steps: { reg: { "b0": 0xFA } }
    }
  ],
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "111"
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_byte"
    }
  ],
  "exec": function(rbyte) {
    this.writeByteRegister(rbyte.address, this.popByte());
  }
}
