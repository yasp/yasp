{
  "name": "ADD",
  "doc": {
    "de": {
      "description": "Addiert die Werte der beiden Register.",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis größer als 255 (ein Byte) ist"
      }
    },
    "en": {
      "description": "Adds the values of both registers.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 255 (one byte)"
      }
    }
  },
  "tests": [
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 255, "b1": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 0xFF, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000001"
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
    var newVal = rbyte1.value + rbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
    this.writeFlags((newVal > 0xFF), null);
  }
}
