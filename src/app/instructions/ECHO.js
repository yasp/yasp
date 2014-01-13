{
  "name": ["ECHO", "DEBUG", "PRINT"],
  "doc": {
    "de": {
      "description": "",
      "flags": {
      }
    },
    "en": {
      "description": "",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": "11010"
    }
  ],
  "params": [
    {
      "type": "address"
    }
  ],
  "exec": function(addr) {
    this.debugString(addr.value);
  }
}
