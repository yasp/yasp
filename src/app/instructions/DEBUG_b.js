{
  "name": "DEBUG",
  "doc": {
    "de": {
      "description": "Sendet den Wert eines Byte-Registers zum Debugger.",
      "flags": {
      }
    },
    "en": {
      "description": "Sends the value of a byte register to the debugger.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": 0x50
    },
    {
      "value": "000",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_byte"
    }
  ],
  "exec": function (rbyte) {
    this.debugRegister('b', rbyte.address, rbyte.value);
  }
}
