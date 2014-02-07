{
  "name": "JZ",
  "doc": {
    "de": {
      "description": "Springt zum gegebenen Label wenn das Zero-Flag gesetzt ist.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps to the given label only when the zero-flag is set.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: { reg: { "pc": 2 } }
    },
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: { reg: { "pc": 3 } }
    }
  ],
  "code": [
    {
      "value": "11100"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(this.isZeroFlagSet())
      this.writePC(addr.value);
  }
}
