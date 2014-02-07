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
  "tests": [
    {
      cmd: "ECHO str\nstr: STRING \"foo\"",
      steps: { debug: { "addr": 5, "subtype": null, "type": "string", "val": "foo" } }
    }
  ],
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
