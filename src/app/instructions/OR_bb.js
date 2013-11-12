{
  "name": "OR",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000101",
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
  "checkFlags": { "z": true },
  "exec": function (rbyte1, rbyte2) {
    var newVal = rbyte1.value | rbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
  }
}
