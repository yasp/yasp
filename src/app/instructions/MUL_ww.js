{
  "name": "MUL",
  "doc": {
    "de": {
      "description": "Multipliziert die beiden niederwertigen bytes der register.",
      "flags": {
      }
    },
    "en": {
      "description": "Multiplies the two least significant bytes of the registers.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "MUL w0,w1",
      setup: { reg: { "w0": 0xFF10, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x0020 } }
    },
    {
      cmd: "MUL w0,w1",
      setup: { reg: { "w0": 0x00FF, "w1": 0x00FF } },
      steps: { reg: { "w0": 0xFE01 } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010111"
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
    var newVal = (rword1.value & 0xFF) * (rword2.value & 0xFF);
    this.writeWordRegister(rword1.address, newVal);
  }
}
