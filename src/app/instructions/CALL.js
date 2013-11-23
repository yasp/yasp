{
  "name": "CALL",
  "description": "",
  "code": [
    {
      "value": "11000"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    this.pushWord(this.readPC());
    this.writePC(addr.value);
  }
}
