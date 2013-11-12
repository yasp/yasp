{
  "name": "DEC",
  "description": "",
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte) {
    var newVal = rbyte.value - 1;
    this.writeByteRegister(rbyte.address, newVal & 0xFF);
    this.writeFlags((newVal < 0), null);
  }
}
