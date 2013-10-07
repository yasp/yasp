{
  "name": "ADD",
  "description": "",
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010001",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword1, rword2) {
    var oldVal = rword1.value;
    var newVal = (rword1.value + rword2.value) & 0xFFFF;
    var flags = { c: false, z: false };

    if(oldVal > newVal)
      flags.c = true;
    if(newVal == 0)
      flags.z = true;

    this.writeWordRegister(rword1.address, newVal);
    this.writeFlags(flags);
  }
}
