if (typeof yasp == 'undefined') yasp = { };

(function() {

  yasp.Hardware = function (data) {
    this.name = data.name;
    this.iobank = yasp.IOBank.fromJSON(data.pins, yasp.timeTickSupplier);
    this.uiEvent = data.uiEvent.bind(this);
    this.funcs = {
      receiveStateChange: data.receiveStateChange.bind(this),
      getState: data.getState.bind(this)
    };
  };

  yasp.Hardware.prototype.getPinMode = function (nr) {
    return this.getPin(nr).mode;
  };

  yasp.Hardware.prototype.setStateChangedEvent = function (func) {
    this.iobank.setStateChangedEvent(func);
  };

  yasp.Hardware.prototype.receiveStateChange = function (nr, state) {
    var pin = this.getPin(nr);

    if(pin.mode === 'in') {
      pin.state = state;
      this.funcs.receiveStateChange(pin);
    }
  };

  yasp.Hardware.prototype.getState = function () {
    return this.funcs.getState();
  };

  yasp.Hardware.prototype.getPin = function (nr) {
    return this.iobank.getPin(nr);
  };

  yasp.Hardware.makeHardware = function (data) {
    return function () {
      return new yasp.Hardware(data);
    };
  };


  yasp.HardwareRenderer = function (backend, container, params, data) {
    this.name = data.name;
    this.backend = backend;
    this.container = container;
    this.params = params;

    this.create = data.create.bind(this);
    this.subRender = data.render.bind(this);
  };

  yasp.HardwareRenderer.prototype.render = function () {
    var state = this.backend.getState();
    return this.subRender(state);
  };

  yasp.HardwareRenderer.makeRenderer = function (data) {
    return function (backend, container, params) {
      return new yasp.HardwareRenderer(backend, container, params, data);
    };
  };
})();