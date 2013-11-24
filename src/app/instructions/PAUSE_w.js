{
  "name": ["DELAY", "PAUSE"],
  "doc": {
    "de": {
      "description": "Wartet die im Register angegebene Zeit, z.B.: 1000 = 15ms, 60000 = 900ms",
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
      "value": 0x70
    },
    {
      "value": "010",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.wait(rword.value);
  }
}
