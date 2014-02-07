{
  "name": "RANDOM",
  "doc": {
    "de": {
      "description": "Schreibt einen zufälligen Wert in das Register.",
      "flags": {
      }
    },
    "en": {
      "description": "Writes a random value into the register.",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "RANDOM b1",
      steps: { /* check for changed value.. uhm.. */ }
    }
  ],
  "code": [
    {
      "value": 0x50
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte) {
    this.writeByteRegister(rbyte.address, Math.random() * 255 & 0xFF);
  }
}
