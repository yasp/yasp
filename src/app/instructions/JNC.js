{
  "name": "JNC",
  "description": "",
  "code": [
    {
      "value": "00011"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(!this.isCarryFlagSet())
      this.writePC(addr.value);
  }
}
