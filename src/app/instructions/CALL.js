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
  "tests": [
    {
      title: "CALL",
      cmd: "CALL lbl\nDB 0\nlbl:",
      steps: { reg: { "pc": 3, "sp": 2 }, stack: [ 0x02, 0x00 ]  }
    }
  ],
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
