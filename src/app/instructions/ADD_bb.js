{
  "name": "ADD",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000001",
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
  "checkFlags": { "z": true, "c": true },
  "exec": function (rbyte1, rbyte2) {
    var newVal = (rbyte1.value + rbyte2.value) & 0xFF;
    this.writeByteRegister(rbyte1.address, newVal);
  }
}
