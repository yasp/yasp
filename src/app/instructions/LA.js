{
  "name": "LA",
  "doc": {
    "de": {
      "description": "Schreibt die Adresse eines Labels in das Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Writes the address of an label into the register.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "LA w0,lbl\nlbl:",
      steps: { reg: { "w0": 0x0004 } }
    }
  ],
  "code": [
    {
      "value": 0x28
    },
    {
      "value": 0x00
    }
  ],
  "params": [
    {
      "valueNeeded": false,
      "type": "r_word"
    },
    {
      "type": "address"
    }
  ],
  "exec": function (rword, addr) {
    this.writeWordRegister(rword.address, addr.value);
  }
}
