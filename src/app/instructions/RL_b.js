{
  "name": "RL",
  "description": "This instruction shifts the bytes in the byte register by 1 bit to the left into the carry bit.",
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "101",
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
    var newVal = (oldVal << 1) & 0xFF;
    
    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal & 0x80), null);
  }
}
