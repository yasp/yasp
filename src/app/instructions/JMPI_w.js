{
  "name": "JMPI",
  "doc": {
    "de": {
      "description": "Springt zur adresse aus dem Word-Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps to the address given in the word register.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "JMPI w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: { reg: { "pc": 0xFAFB } }
    }
  ],
  "code": [
    {
      "value": 0x70
    },
    {
      "value": "001"
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function(rword) {
    this.writePC(rword.value);
  }
}
