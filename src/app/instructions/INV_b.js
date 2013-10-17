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
  "exec": function (rbyte1) {
    var newVal = (~rbyte1.value) & 0xFF;
    var flags = { z: newVal == 0};
  
    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(flags);
  }
}
