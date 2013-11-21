{
  "name": [ "RETI", "RET" ],
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
