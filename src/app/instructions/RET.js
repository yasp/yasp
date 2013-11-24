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
