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
