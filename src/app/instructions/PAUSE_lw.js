{
  "name": ["DELAY", "PAUSE"],
  "doc": {
    "de": {
      "description": "Wartet die angegebene Zeit, z.B.: 1000 = 15ms, 60000 = 900ms",
      "flags": {
      }
    },
    "en": {
      "description": "Waits a given time, e.g.: 1000 = 15ms, 60000 = 900ms",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x30
    },
    {
      "value": "01100000",
      "length": 8
    }
  ],
  "params": [
    {
      "type": "l_word"
    }
  ],
  "exec": function (lword) {
    this.wait(lword.value);
  }
}
