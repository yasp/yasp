{
  "name": "DEBUG",
  "doc": {
    "de": {
      "description": "",
      "flags": {
      }
    },
    "en": {
      "description": "",
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
