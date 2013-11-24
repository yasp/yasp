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
