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
