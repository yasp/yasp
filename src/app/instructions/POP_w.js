{
  "name": "POP",
  "doc": {
    "de": {
      "description": "Nimmt die zwei obersten Byte vom Stack und schreibt sie in das register. Das erste Byte wird zum niederwertigsten Byte des Words.",
      "flags": {
      }
    },
    "en": {
      "description": "Takes the top two bytes from the stack and writes them into the register. The first byte becomes the least significant byte in the word.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "POP w0",
      setup: { reg: { "sp": 2 }, stack: [0xFB, 0xFA] },
      steps: { reg: { "w0": 0xFAFB } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "111",
      "length": 3
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_word"
    }
  ],
  "exec": function(rword) {
    this.writeWordRegister(rword.address, this.popWord());
  }
}
