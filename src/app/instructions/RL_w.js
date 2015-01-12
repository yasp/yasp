{
  "name": "RL",
  "doc": {
    "de": {
      "description": "Shiftet das register um ein Bit nach links in das Carry-Flag. Wenn das Carry-Flag gesetzt ist, wird das rechteste Bit gesetzt. z.B.: 00000010 10000000 => 00000101 00000000",
      "flags": {
        "c": "wird gesetzt wenn das höchstwertigste Bit des Wertes 1 war"
      }
    },
    "en": {
      "description": "Shifts the register by one bit to the left into the carry bit. If the carry-flag is set, the rightest bit will be set. Example: 00000010 10000000 => 00000101 00000000",
      "flags": {
        "c": "is set if the most-significant bit of the value was 1"
      }
    }
  },
  "tests": [
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "01111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "11111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "00000000 00000000" }, flags: { c: true, z: false } },
      steps: { reg: { "w0": "00000000 00000001" } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "101"
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

    if(this.isCarryFlagSet() === true)
      newVal = newVal | 1;
  
    this.writeWordRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal &  0x8000), null);
  }
}
