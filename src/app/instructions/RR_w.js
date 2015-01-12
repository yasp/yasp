{
  "name": "RR",
  "doc": {
    "de": {
      "description": "Rotiert das Register um ein Bit nach rechts durch Carry-Flag. Wenn das Carry-Flag gesetzt ist, wird das linkste Bit gesetzt. z.B.: 00000010 10000000 => 00000001 01000000",
      "flags": {
        "c": "wird gesetzt wenn das niederwertigste Bit des Wertes 1 war"
      }
    },
    "en": {
      "description": "Rotates the register by one bit to the right through the carry bit. If the carry-flag is set, the leftest bit will be set. Example: 00000010 10000000 => 00000001 01000000",
      "flags": {
        "c": "is set if the least-significant bit of the value was 1"
      }
    }
  },
  "tests": [
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "00011111 11111000" } },
      steps: { reg: { "w0": "00001111 11111100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "11111111 10101011" } },
      steps: { reg: { "w0": "01111111 11010101" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "00000000 00000000" }, flags: { c: true, z: false } },
      steps: { reg: { "w0": "10000000 00000000" } }
    }
  ],
  "code": [
    {
      "value": 0x60
    },
    {
      "value": "100"
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rbyte1) {
    var oldVal = rbyte1.value;
    var newVal = (oldVal >> 1) & 0xFFFF;

    if(this.isCarryFlagSet() === true)
      newVal = newVal | 0x8000; // 10000000 00000000b

    this.writeWordRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal &  1), null);
  }
}
