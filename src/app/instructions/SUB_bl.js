{
  "name": "SUB",
  "doc": {
    "de": {
      "description": "Subtrahiert den gegebenen Wert von dem Wert des Registers.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis kleiner als 0 ist"
      }
    },
    "en": {
      "description": "Subtracts the given value from the value of the first register.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result smaller than 0"
      }
    }
  },
  "tests": [
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,2",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "010"
    }
  ],
  "params": [
    {
      "type": "r_byte"
    },
    {
      "type": "l_byte"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rbyte1, lbyte2) {
    var newVal = rbyte1.value - lbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
    this.writeFlags((newVal < 0), null);
  }
}
