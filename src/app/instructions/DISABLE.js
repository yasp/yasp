{
  "name": "DISABLE",
  "description": "",
  "code": [
    {
      "value": "00111010",
      "length": 8
    }
  ],
  "params": [
  ],
  "exec": function () {
    this.setInterruptMask(0);
  }
}
