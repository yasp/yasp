{
  "name": "JNZ",
  "doc": {
    "de": {
      "description": "Springt zum gegebenen Label wenn das Zero-Flag gesetzt nicht ist.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps to the given label only when the zero-flag is not set.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: { reg: { "pc": 3 } }
    },
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: { reg: { "pc": 2 } }
    }
  ],
  "code": [
    {
      "value": "11110"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(!this.isZeroFlagSet())
      this.writePC(addr.value);
  }
}
