{
  "name": "ADD",
  "description": "",
  "code": [
    {
      "value": 0x20
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "l_word"
    }
  ],
  "exec": function (rword1, lword2) {
    var oldVal = rword1.value;
    var newVal = (rword1.value + lword2.value) & 0xFFFF;
    var flags = { c: false, z: false };

    if(oldVal > newVal)
      flags.c = true;
    if(newVal == 0)
      flags.z = true;

    this.writeWordRegister(rword1.address, newVal);
    this.writeFlags(flags);
  }
}
