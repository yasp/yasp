{
  "name": "DIV",
  "doc": {
    "de": {
      "description": "Dividiert den Wert des ersten Registers durch das niederwertige Byte des zweiten Registers.",
      "flags": {
      }
    },
    "en": {
      "description": "Divides the value of the first Register with the least significant byte of the second register.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x00FA, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x7D } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0xFF10, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x7F88 } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x000F, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x0007 } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x000F, "w1": 0 } },
      steps: { running: false, breakReason: "divide_by_zero" }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "011000",
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
    if(rword2.value === 0) {
      this.break("divide_by_zero");
      return;
    }

    var newVal = ~~(rword1.value / (rword2.value & 0xFF));
    this.writeWordRegister(rword1.address, newVal);
  }
}
