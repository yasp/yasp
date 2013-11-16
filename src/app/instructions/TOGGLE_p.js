{
  "name": "TOGGLE",
  "description": "",
  "code": [
    {
      "value": 0xA0
    },
    {
      "value": "010",
      "length": 3
    }
  ],
  "params": [
    {
      "type": "pin"
    }
  ],
  "exec": function (pin) {
    this.setIO(pin.address, !pin.value);
  }
}
