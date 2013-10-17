{
  "name": "RL",
  "description": "This instruction shifts the bytes in the word register by 1 bit to the left into the carry bit. The zero bit is set according to the lowest significant bit.",
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
    var flags = { c: !!(oldVal &  0x8000), z: !(oldVal &  0x8000)};
  
    this.writeWordRegister(rbyte1.address, newVal);
    this.writeFlags(flags);
  }
}
