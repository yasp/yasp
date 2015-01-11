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
  "tests": [
    {
      cmd: "BREAK",
      steps: { running: false, breakReason: "break_instr" }
    }
  ],
  "code": [
    {
      "value": "00111000"
    }
  ],
  "params": [ ],
  "exec": function() {
    this.break("break_instr");
  }
}
