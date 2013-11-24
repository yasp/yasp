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
