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
  "code": [
    {
      "value": 0x70
    },
    {
      "value": "001",
      "length": 3
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
