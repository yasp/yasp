{
  "name": "LOW",
  "description": "",
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "001",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.setIO(pin.address, false);
  }
}
