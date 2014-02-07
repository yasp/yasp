{
  "name": "CMP",
  "doc": {
    "de": {
      "description": "Vergleicht zwei Werte.",
      "flags": {
        "z": "wird gesetzt wenn die Werte gleich sind",
        "c": "wird gesetzt wenn der zweite Wert größer ist als der erste.",
      }
    },
    "en": {
      "description": "Compares two values.",
      "flags": {
        "z": "is set if the values are equal",
        "c": "is set if the second value is greater than the first value",
      }
    }
  },
  "tests": [
    {
      cmd: "CMP b0,b1 ;equal",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP b0,b1 ;1st bigger",
      setup: { reg: { "b0": 1, "b1": 0 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP b0,b1 ;2nd bigger",
      setup: { reg: { "b0": 0, "b1": 1 } },
      steps: { flags: { c: true, z: false } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000011",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte1, rbyte2) {
    var zero = rbyte1.value === rbyte2.value;
    var carry = rbyte1.value < rbyte2.value;
    this.writeFlags(carry, zero);
  }
}
