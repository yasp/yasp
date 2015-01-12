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
  "tests": [
    {
      cmd: "PAUSE w0",
      setup: { reg: { "w0": 1000 } },
      steps: { waitTime: 15 }
    },
    {
      cmd: "DELAY w0",
      setup: { reg: { "w0": 1000 } },
      steps: { waitTime: 15 }
    }
  ],
  "code": [
    {
      "value": 0x70
    },
    {
      "value": "010"
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
