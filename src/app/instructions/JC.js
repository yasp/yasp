{
  "name": "JC",
  "doc": {
    "de": {
      "description": "Springt zum gegebenen Label wenn das Carry-Flag gesetzt ist.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps to the given label only when the carry-flag is set.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: { reg: { "pc": 2 } }
    },
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: { reg: { "pc": 3 } }
    }
  ],
  "code": [
    {
      "value": "00001"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(this.isCarryFlagSet())
      this.writePC(addr.value);
  }
}
