{
  "name": ["GOTO", "JMP"],
  "description": "",
  "code": [
    {
      "value": "10110"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    this.writePC(addr.value);
  }
}
