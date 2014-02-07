{
  "name": "ADD",
  "doc": {
    "de": {
      "description": "Addiert die Werte der beiden Register",
      "flags": {
        "z": "wird gesetzt wenn das Ergebnis 0 ist",
        "c": "wird gesetzt wenn das Ergebnis größer als 65535 (ein word) ist"
      }
    },
    "en": {
      "description": "Adds the values of both registers.",
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 65535 (one word)"
      }
    }
  },
  "tests": [
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0x0A10, "w1": 0x01FF } },
      steps: { reg: { "w0": 0x0C0F }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0002 } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ],
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "010001",
      "length": 6
    }
  ],
  "params": [
    {
      "type": "r_word"
    },
    {
      "type": "r_word"
    }
  ],
  "checkFlags": { "z": true },
  "exec": function (rword1, rword2) {
    var newVal = rword1.value + rword2.value;
    this.writeWordRegister(rword1.address, newVal & 0xFFFF);
    this.writeFlags((newVal > 0xFFFF), null);
  }
}
