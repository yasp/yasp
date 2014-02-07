{
  "name": "JNC",
  "doc": {
    "de": {
      "description": "Springt zum gegebenen Label wenn das Carry-Flag nicht gesetzt ist.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps to the given label only when the carry-flag is not set.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ],
  "code": [
    {
      "value": "00011"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(!this.isCarryFlagSet())
      this.writePC(addr.value);
  }
}
