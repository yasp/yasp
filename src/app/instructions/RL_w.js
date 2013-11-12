{
  "name": "RL",
  "description": "This instruction shifts the bytes in the word register by 1 bit to the left into the carry bit.",
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "101",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rbyte1) {
    var oldVal = rbyte1.value;
    var newVal = (oldVal << 1) & 0xFFFF;
  
    this.writeWordRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal &  0x8000), null);
  }
}
