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
      cmd: "CMP w0,0x0001 ;equal",
      setup: { reg: { "w0": 0x0001 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP w0,0xAA00 ;1st bigger",
      setup: { reg: { "w0": 0xAB00 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,0x0000 ;1st bigger",
      setup: { reg: { "w0": 0x0001 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,0xAB00 ;2nd bigger",
      setup: { reg: { "w0": 0xAA00 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,0x0001 ;2nd bigger",
      setup: { reg: { "w0": 0x0000 } },
      steps: { flags: { c: false, z: false } }
    }
  ],
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "011",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "l_word"
    }
  ],
  "exec": function (rword1, lword2) {
    var zero = rword1.value === lword2.value;
    var carry = rword1.value > lword2.value;
    this.writeFlags(carry, zero);
  }
}
