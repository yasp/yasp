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
  "tests": [
    {
      cmd: "PUSH b0",
      setup: { reg: { "b0": 0xFA } },
      steps: { reg: { "sp": 0 }, stack: { 0: 0xFA } }
    }
  ],
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
