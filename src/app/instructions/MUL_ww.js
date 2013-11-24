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
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010111",
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
    var newVal = (rword1.value & 0xFF) * (rword2.value & 0xFF);
    this.writeWordRegister(rword1.address, newVal);
  }
}
