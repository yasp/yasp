{
  "name": [ "BREAK" ],
  "doc": {
    "de": {
      "description": "Stoppt die CPU.",
      "flags": {
      }
    },
    "en": {
      "description": "Stops the CPU.",
      "flags": {
      }
    }
  },
  "code": [
    {
      "value": "00111000"
    }
  ],
  "params": [ ],
  "exec": function() {
    this.break();
  }
}
