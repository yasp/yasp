{
  "name": "CALL",
  "doc": {
    "de": {
      "description": "Pusht den aktuelle Position als Word auf den Stack und springt dann zum gegebenen Label.",
      "flags": {
      }
    },
    "en": {
      "description": "Pushes the current position onto the stack and jumps to the given label.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": "11000"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    this.pushWord(this.readPC());
    this.writePC(addr.value);
  }
}
