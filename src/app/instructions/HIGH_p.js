{
  "name": "HIGH",
  "description": "",
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "000",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.setIO(pin.address, true);
  }
}
