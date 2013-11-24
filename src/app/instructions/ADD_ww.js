{
  "name": "ADD",
  "doc": {
    "de": {
      "description": "Addiert die Werte der beiden Register",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis größer als 65535 (ein word) ist"
      }
    },
    "en": {
      "description": "Adds the values of both registers.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 65535 (one word)"
      }
    }
  },
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010001",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword1, rword2) {
    var newVal = rword1.value + rword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
    this.writeFlags((newVal > 0xFFFF), null);
  }
}
