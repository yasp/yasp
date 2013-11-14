{
  "name": "JC",
  "description": "",
  "code": [
    {
      "value": "00001"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(this.isCarryFlagSet())
      this.writePC(addr.value);
  }
}
