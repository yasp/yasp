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
