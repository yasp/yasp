{
  "name": "JNZ",
  "description": "",
  "code": [
    {
      "value": "11110"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    if(!this.isZeroFlagSet())
      this.writePC(addr.value);
  }
}
