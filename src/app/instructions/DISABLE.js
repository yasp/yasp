{
  "name": "DISABLE",
  "doc": {
    "de": {
      "description": "Deaktiviert alle interrupts",
      "flags": {
      }
    },
    "en": {
      "description": "Disables all interrupts",
      "flags": {
      }
    }
  },
  "tests": [
    {
      cmd: "DISABLE",
      setup: { interruptMask: [ true, true, true, true, true, true, true, true ] },
      steps: { interruptMask: [ false, false, false, false, false, false, false, false ] }
    }
  ],
  "code": [
    {
      "value": "00111010",
      "length": 8
    }
  ],
  "params": [
  ],
  "exec": function () {
    this.setInterruptMask(0);
  }
}
