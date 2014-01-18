{
  "name": ["ECHO", "DEBUG", "PRINT"],
  "doc": {
    "de": {
      "description": "Sendet einen String zum Debugger. Der String muss wie folgt definiert sind: 'stringName: STRING foobar'",
      "flags": {
      }
    },
    "en": {
      "description": "Sends a string to the debugger. The string has to be defined like this: 'stringName: STRING foobar'",
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
