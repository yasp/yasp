{
  "name": "SUB",
  "doc": {
    "de": {
      "description": "Subtrahiert den Wert des zweiten Registers von dem des ersten.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis kleiner als 0 ist"
      }
    },
    "en": {
      "description": "Subtracts the value of the second register from the first one.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result smaller than 0"
      }
    }
  },
  "tests": [
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 2, "b1": 1 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 2 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000010"
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "r_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte1, rbyte2) {
    var newVal = rbyte1.value - rbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
    this.writeFlags((newVal < 0), null);
  }
}
