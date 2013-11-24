{
  "name": "RL",
  "doc": {
    "de": {
      "description": "Shiftet das register um ein Bit nach links in das Carry-Flag, z.B.: 00100000 => 01000000",
      "flags": {
        "c": "wird gesetzt wenn das höchstwertigste Bit des Wertes 1 war"
      }
    },
    "en": {
      "description": "Shifts the register by one bit to the left into the carry bit, e.g. 00100000 => 01000000",
      "flags": {
        "c": "is set if the most-significant bit of the value was 1"
      }
    }
  },
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
