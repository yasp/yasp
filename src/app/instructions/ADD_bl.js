{
  "name": "ADD",
  "doc": {
    "de": {
      "description": "Addiert den Wert des Registers mit dem zweiten Parameter.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis größer als 255 (ein word) ist"
      }
    },
    "en": {
      "description": "Adds the value of the register and the given literal value.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 255 (one word)"
      }
    }
  },
  "tests": [
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,2",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x00
    },
    {
      "value": "001"
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
    var newVal = rbyte1.value + lbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
    this.writeFlags((newVal > 0xFF), null);
  }
}
