{
  "name": "ADD",
  "description": "",
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "001",
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
  "exec": function (rbyte1, lbyte2) {
    var oldVal = rbyte1.value;
    var newVal = (rbyte1.value + lbyte2.value) & 0xFF;
    var flags = { c: false, z: false };

    if(oldVal > newVal)
      flags.c = true;
    if(newVal == 0)
      flags.z = true;

    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(flags);
  }
}
