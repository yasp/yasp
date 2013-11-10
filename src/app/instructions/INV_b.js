a={
  "name": "INV",
  "description": "Calculates the 1's complement on the specified byte register. If the result equals 0 the zero bit is set.",
  "code": [
  {
    "value": 0x40
  },
  {
    "value": "010",
    "length": 3
  }
],
  "params": [
  {
    "type": "r_byte"
  }
],
  "checkFlags": { "z": true },
  "exec": function (rbyte1) {
    var newVal = (~rbyte1.value) & 0xFF;
    this.writeByteRegister(rbyte1.address, newVal);
  }
}
