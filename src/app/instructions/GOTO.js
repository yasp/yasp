{
  "name": ["GOTO", "JMP"],
  "doc": {
    "de": {
      "description": "Springt zum gegebenen Label.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps to the given label.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "JMP lbl\nDB 0xFF\nlbl:",
      steps: { reg: { "pc": 3 } }
    }
  ],
  "code": [
    {
      "value": "10110"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    this.writePC(addr.value);
  }
}
