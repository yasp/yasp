if (typeof yasp == 'undefined') yasp = { };

(function() {

  /** a collection of pins
   * @constructor
   */
  yasp.IOBank = function () {
    this.pins = [];
  };

  /** get the json representations of all pins as an array
   * @returns {Array}
   * @see yasp.Pin#getJSON
   */
  yasp.IOBank.prototype.getJSON = function () {
    var state = [];

    for(var nr in this.pins) {
      state.push(this.getPin(nr).getJSON());
    }

    return state;
  };

  /** sets the handler, which is called when one of the pin-states changes
   * @param func
   */
  yasp.IOBank.prototype.setStateChangedEvent = function(func) {
    if(typeof func !== 'function') {
      throw "invalid callback function";
    }

    for(var nr in this.pins) {
      var pin = this.getPin(nr);
      pin.STATE_CHANGED = func;
    }
  };

  /** get the pin object with number nr
   * @param nr
   * @returns {yasp.Pin}
   */
  yasp.IOBank.prototype.getPin = function (nr) {
    return this.pins[nr];
  };

  /** add a pin to this IOBank. Existing Pins will ob overwritten and their STATE_CHANGED event cleared.
   * @param pin {Number}
   */
  yasp.IOBank.prototype.addPin = function (pin) {
    if(!(pin instanceof yasp.Pin)) {
      throw "pin parameter must be a pin object";
    }

    this.removePin(pin.nr);
    this.pins[pin.nr] = pin;
  };

  /** add multiple pins
   * @param pins {Array}
   * @see yasp.IOBank#addPin
   */
  yasp.IOBank.prototype.addPins = function (pins) {
    for (var i = 0; i < pins.length; i++) {
      var pin = pins[i];
      this.addPin(pins[i]);
    }
  };

  /** removes a pin and resets its STATE_CHANGED function
   * @param nr
   */
  yasp.IOBank.prototype.removePin = function (nr) {
    if(this.pins[nr] !== undefined) {
      this.pins[nr].STATE_CHANGED = function () { };
      delete this.pins[nr];
    }
  };
})();
