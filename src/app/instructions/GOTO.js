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
