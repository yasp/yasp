{
  "name": [ "RETI", "RET", "RETURN" ],
  "doc": {
    "de": {
      "description": "Springt aus einer Subroutine oder einem Interrupt heraus. Es wird Word von dem Stack gelesen und als Zieladresse genutzt.",
      "flags": {
      }
    },
    "en": {
      "description": "Jumps out of a subroutine or interrupt. One word is read from the stack and used as targetaddress.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "RET",
      setup: { reg: { "sp": 2 }, stack: [ 0xFF, 0xFA ] },
      steps: { reg: { "pc": 0xFAFF } }
    }
  ],
  "code": [
    {
      "value": "00111011"
    }
  ],
  "params": [ ],
  "exec": function() {
    this.writePC(this.popWord());
  }
}
