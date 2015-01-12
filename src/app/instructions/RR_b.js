{
  "name": "RR",
  "doc": {
    "de": {
    "description": "Rotiert das Register um ein Bit nach rechts durch Carry-Flag. Wenn das Carry-Flag gesetzt ist, wird das linkste Bit gesetzt. z.B.: 00000010 => 00000001",
      "flags": {
        "c": "wird gesetzt wenn das niederwertigste Bit des Wertes 1 war"
      }
    },
    "en": {
    "description": "Rotates the register by one bit to the right through the carry bit. If the carry-flag is set, the leftest bit will be set. Example: 00000010 => 00000001",
      "flags": {
        "c": "is set if the least-significant bit of the value was 1"
      }
    }
  },
  "tests": [
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000001" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "00000000" }, flags: { c: true, z: false } },
      steps: { reg: { "b0": "10000000" } }
    }
  ],
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "100"
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

    if(this.isCarryFlagSet() === true)
      newVal = newVal | 0x80; // 10000000b

    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal &  1), null);
  }
}
