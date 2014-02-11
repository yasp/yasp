{
  "name": "CMP",
  "doc": {
    "de": {
      "description": "Vergleicht zwei Werte.",
      "flags": {
        "z": "wird gesetzt wenn die Werte gleich sind",
          "c": "wird gesetzt wenn der erste Wert größer ist als der zweite.",
      }
    },
    "en": {
      "description": "Compares two values.",
      "flags": {
        "z": "is set if the values are equal",
          "c": "is set if the first value is greater than the second value",
      }
    }
  },
  "tests": [
    {
      cmd: "CMP w0,w1 ;equal",
      setup: { reg: { "w0": 0x0001, "w1": 0x0001 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP w0,w1 ;1st bigger",
      setup: { reg: { "w0": 0xAB00, "w1": 0xAA00 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;1st bigger",
      setup: { reg: { "w0": 0x0001, "w1": 0x0000 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;2nd bigger",
      setup: { reg: { "w0": 0xAA00, "w1": 0xAB00 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;2nd bigger",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { flags: { c: false, z: false } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010011",
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
  "exec": function (rword1, rword2) {
    var zero = rword1.value === rword2.value;
    var carry = rword1.value > rword2.value;
    this.writeFlags(carry, zero);
  }
}
