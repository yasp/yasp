{
  "name": "PIN",
  "description": "",
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "101",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.writeFlags(null, !pin.value);
  }
}
