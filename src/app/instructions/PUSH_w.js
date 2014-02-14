{
  "name": "PUSH",
  "doc": {
    "de": {
      "description": "Pusht ein Word auf den Stack. Das niederwertige Byte wird zuerst gepusht.",
      "flags": {
      }
    },
    "en": {
      "description": "Pushes one word onto the stack. The least significant byte is pushed first.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "PUSH w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: { reg: { "sp": 2 }, stack: { 0: 0xFB, 1: 0xFA } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "110",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function(rword) {
    this.pushWord(rword.value);
  }
}
