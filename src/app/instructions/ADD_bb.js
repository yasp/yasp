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
  "exec": function (rbyte1, rbyte2) {
    var oldVal = rbyte1.value;
    var newVal = (rbyte1.value + rbyte2.value) & 0xFF;
    var flags = { c: false, z: false };

    if(oldVal > newVal)
      flags.c = true;
    if(newVal == 0)
      flags.z = true;

    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(flags);
  }
}
