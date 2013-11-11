{
  "name": "RR",
  "description": "This instruction shifts the bytes in the byte register by 1 bit to the right into the carry bit. The zero bit is set according to the lowest significant bit.",
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "100",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte1) {
    var oldVal = rbyte1.value;
    var newVal = (oldVal >> 1) & 0xFF;
    
    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal &  1), null);
  }
}
