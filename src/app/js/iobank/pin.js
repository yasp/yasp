if (typeof yasp == 'undefined') yasp = { };

(function() {

  /** Represents a hardpare io-pin within an IOBank. This handles keeping
   * of the basic pin state and PWM, if enabled.
   * @param nr {Number} pin number
   * @param type {String} 'gpio' or 'adc'
   * @param mode {String} 'in' or 'out'
   * @param pwm {Boolean} true, if PWM should be enabled, otherwise false
   * @param tickSupplier {Object} an object, which has a getTicks()-function to tell the pin how much time has passed. Only needed when PWM is enabled.
   * @constructor
   */
  yasp.Pin = function (nr, type, mode, pwm, tickSupplier) {
    if(typeof nr !== 'number') {
      throw "nr must be a number";
    }
    this.nr = nr;

    if(type !== 'adc' && type !== 'gpio') {
      throw "type must be 'adc' or 'gpio'";
    }
    this.type = type;

    if(mode !== 'in' && mode !== 'out') {
      throw "mode must be 'in' or 'out'";
    }
    this.mode = mode;

    if(mode === 'out' && type === 'adc') {
      throw "ADC pins can only be mode 'in'";
    }

    this.pwm = (typeof pwm === 'boolean') ? pwm : false;

    if(this.pwm === true && tickSupplier && typeof tickSupplier.getTicks !== 'function') {
      throw "invalid tick supplier (must have getTicks() and getTimePerTick())";
    }

    this.tickSupplier = tickSupplier;

    this.STATE_CHANGED = function () {};

    this.pwmStatus = {};
    this.pwmTimeout = {};

    this.setState(0, true);
  };

  yasp.Pin.fromJSON = function (data, tickSupplier) {
    return new yasp.Pin(
      data.nr,
      data.type,
      data.mode,
      data.pwm,
      tickSupplier
    );
  };

  /** generates a json representation of the current pin state and its properties
   * @returns {{pin: Number, type: String, mode: String, state: Number}}
   */
  yasp.Pin.prototype.getJSON = function () {
    return {
      "pin": this.nr,
      "type": this.type,
      "mode": this.mode,
      "state": this.state
    };
  };

  /**
   * @private
   */
  yasp.Pin.prototype.clearPwmTimeout = function () {
    if(this.pwmTimeout !== null) {
      clearTimeout(this.pwmTimeout);
    }

    this.pwmTimeout = null;
  };

  /**
   * @private
   */
  yasp.Pin.prototype.resetPwm = function () {
    this.pwmStatus = {
      startOn: null,
      startOff: null,
      state: null
    };

    this.clearPwmTimeout();
  };

  /** update internal PWM state and set the real pin state.
   * This is called each time the pin state should change and works
   * by measuring how long the pin is high compared to its low-time.
   * @private
   * @param s {Number} new pin state set
   */
  yasp.Pin.prototype.updatePwm = function (s) {
    var now = this.tickSupplier.getTicks();

    if(s === 1) {
      if(this.pwmStatus.startOn === null) {
        this.pwmStatus.startOn = now;
        this.pwmStatus.startOff = null;
      } else {
        var status = this.pwmStatus;
        var timeOn = status.startOff - status.startOn;
        var timeOff = now - status.startOff;
        var timeTotal = timeOn + timeOff;
        var percentOn = timeOn / timeTotal;

        this.setState(percentOn, true);
      }
    } else if(s === 0 && this.pwmStatus !== null) {
      this.pwmStatus.startOff = now;
    }

    if(this.pwmTimeout !== null) {
      this.clearPwmTimeout();
    }

    this.pwmStatus.state = s;
    this.pwmTimeout = setTimeout(function () {
      this.setState(this.pwmStatus.state, true);
    }.bind(this), 100);
  };

  /** updates the pin state. If PWM is enabled and ignorePwm is not false
   * @param state {Number} state (0 or 1) to set
   * @param ignorePwm {Boolean} true if all PWM code should be skipped and the PWM status reset
   */
  yasp.Pin.prototype.setState = function (state, ignorePwm) {
    if(!ignorePwm && this.pwm === true) {
      this.updatePwm(state);
    } else {
      this.state = state;
      this.STATE_CHANGED(this);
      this.resetPwm();
    }
  };
})();
