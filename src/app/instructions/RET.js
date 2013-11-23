{
  "name": [ "RETI", "RET", "RETURN" ],
  "description": "",
  "code": [
    {
      "value": "00111011"
    }
  ],
  "params": [ ],
  "exec": function() {
    this.writePC(this.popWord());
  }
}
