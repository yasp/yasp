{
  "name": "AND",
  "description": "",
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "100",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "l_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte1, lbyte2) {
    var newVal = rbyte1.value & lbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
  }
}
