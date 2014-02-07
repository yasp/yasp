{
  "name": "RR",
  "doc": {
    "de": {
      "description": "Shiftet das register um ein Bit nach rechts in das Carry-Flag, z.B.: 10000000 => 01000000",
      "flags": {
        "c": "wird gesetzt wenn das niederwertigste Bit des Wertes 1 war"
      }
    },
    "en": {
      "description": "Shifts the register by one bit to the right into the carry bit, e.g. 10000000 => 01000000",
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
    }
  ],
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
