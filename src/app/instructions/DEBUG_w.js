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
      "value": 0x70
    },
    {
      "value": "000",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "r_word"
    }
  ],
  "exec": function (rword) {
    this.debugRegister('w', rword.address, rword.value);
  }
}
