{
  "name": "RL",
  "doc": {
    "de": {
      "description": "Shiftet das register um ein Bit nach links in das Carry-Flag. Wenn das Carry-Flag gesetzt ist, wird das rechteste Bit gesetzt. z.B.: 00100000 => 01000000",
      "flags": {
        "c": "wird gesetzt wenn das höchstwertigste Bit des Wertes 1 war"
      }
    },
    "en": {
      "description": "Shifts the register by one bit to the left into the carry bit. If the carry-flag is set, the rightest bit will be set. Example: 00100000 => 01000000",
      "flags": {
        "c": "is set if the most-significant bit of the value was 1"
      }
    }
  },
  "tests": [
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "10000000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "00000000" }, flags: { c: true, z: false } },
      steps: { reg: { "b0": "00000001" } }
    }
  ],
  "code": [
    {
      "value": 0x40
    },
    {
      "value": "101"
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

    if(this.isCarryFlagSet() === true)
      newVal = newVal | 1;
    
    this.writeByteRegister(rbyte1.address, newVal);
    this.writeFlags(!!(oldVal & 0x80), null);
  }
}
