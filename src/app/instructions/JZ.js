{
  "name": "JZ",
  "description": "",
  "code": [
    {
      "value": "11100"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(this.isZeroFlagSet())
      this.writePC(addr.value);
  }
}
