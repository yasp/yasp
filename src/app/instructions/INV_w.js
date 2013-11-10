a={
  "name": "INV",
  "description": "Calculates the 1's complement on the specified word register. If the result equals 0 the zero bit is set.",
  "code": [
    {
      "value": 0x60
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
  "checkFlags": { "z": true },
  "exec": function (rbyte1) {
    var newVal = (~rbyte1.value) & 0xFFFF;
    this.writeWordRegister(rbyte1.address, newVal);
  }
}
