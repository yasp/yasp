if (typeof yasp == 'undefined') yasp = { };

(function() {

  /** logic or backend part of a hardware component.
   * Refer to the markdown documentation for more information.
   * Do not use this constructor, use makeHardware()
   * @param data
   * @constructor
   */
  yasp.Hardware = function (data) {
    this.name = data.name;
    this.iobank = yasp.IOBank.fromJSON(data.pins, yasp.timeTickSupplier);
    this.uiEvent = data.uiEvent.bind(this);
    this.funcs = {
      receiveStateChange: data.receiveStateChange.bind(this),
      getState: data.getState.bind(this)
    };

    data.init.call(this);
  };

  /** sets a callback function which should be called, if one
   * of the pins state has changed.
   * @param func {Function} callback with the Pin as only parameter
   */
  yasp.Hardware.prototype.setStateChangedEvent = function (func) {
    this.iobank.setStateChangedEvent(func, 'out');
  };

  /** called by the breadboard when a pin state has been changes by
   * the outside environment (e.g. the emulator).
   * @param nr {Number}
   * @param state {Number}
   * @param tick {Number}
   */
  yasp.Hardware.prototype.receiveStateChange = function (nr, state, tick) {
    var pin = this.getPin(nr);

    if(pin.mode === 'in') {
      pin.setState(state, false, tick);
      this.funcs.receiveStateChange(pin, tick);
    }
  };

  /** called by the frontend to get an
   * @returns {*}
   */
  yasp.Hardware.prototype.getState = function () {
    return this.funcs.getState();
  };

  /** get one of the pins of this hardware instance
   * @param nr {Number}
   * @returns {yasp.Pin}
   */
  yasp.Hardware.prototype.getPin = function (nr) {
    return this.iobank.getPin(nr);
  };

  /** shortcut method to get the mode of a hardware pin
   * @param nr {Number}
   * @returns {String}
   */
  yasp.Hardware.prototype.getPinMode = function (nr) {
    return this.getPin(nr).mode;
  };

  /** call this to generate a hardware factory
   * @param data {*} see markdown documentation
   * @returns {Function} factory
   */
  yasp.Hardware.makeHardware = function (data) {
    return function () {
      return new yasp.Hardware(data);
    };
  };

  /** frontend part of an hardware.
   * Refer to the markdown documentation for more information.
   * Do not use this constructor, use makeRenderer()
   * @param backend
   * @param container
   * @param params
   * @param data
   * @constructor
   */
  yasp.HardwareRenderer = function (backend, container, params, data) {
    this.name = data.name;
    this.backend = backend;
    this.container = container;
    this.params = params;

    this.create = data.create.bind(this);
    this.subRender = data.render.bind(this);
  };

  /** called by the breadboard to (re-)render this hardware component.
   */
  yasp.HardwareRenderer.prototype.render = function () {
    var state = this.backend.getState();
    this.subRender(state);
  };

  /** call this to generate a hardware renderer factory
   * @param data {*} see markdown documentation
   * @returns {Function} factory
   */
  yasp.HardwareRenderer.makeRenderer = function (data) {
    return function (backend, container, params) {
      return new yasp.HardwareRenderer(backend, container, params, data);
    };
  };
})();