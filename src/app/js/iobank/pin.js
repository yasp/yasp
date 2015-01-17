if (typeof yasp == 'undefined') yasp = { };

(function() {

  /** Represents a hardpare io-pin within an IOBank. This handles keeping
   * of the basic pin state and PWM, if enabled.
   * @param nr {Number} pin number
   * @param type {String} 'gpio' or 'adc'
   * @param mode {String} 'in' or 'out'
   * @param pwm {Boolean} true, if PWM should be enabled, otherwise false
   * @constructor
   */
  yasp.Pin = function (nr, type, mode, pwm) {
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

    this.STATE_CHANGED = function () {};

    this.pwmStatus = {};
    this.pwmTimeout = {};

    var pin = this;

    this.pwmTimeoutFunc = function () {
      // called by setTimeout, which resets `this`
      pin.setState(pin.pwmStatus.state, true, pin.pwmStatus.tick);
    };

    this.resetPwm();

    this.setState(0, true, 0);
  };

  yasp.Pin.fromJSON = function (data) {
    return new yasp.Pin(
      data.nr,
      data.type,
      data.mode,
      data.pwm
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
      "pwm": this.pwm,
      "state": this.state
    };
  };

  /**
   * @private
   */
  yasp.Pin.prototype.clearPwmTimeout = function () {
    clearTimeout(this.pwmTimeout);
  };

  /**
   * @private
   */
  yasp.Pin.prototype.resetPwm = function () {
    this.pwmStatus = {
      startOn: null,
      startOff: null,
      state: 0
    };

    this.clearPwmTimeout();
  };

  /** update internal PWM state and set the real pin state.
   * This is called each time the pin state should change and works
   * by measuring how long the pin is high compared to its low-time.
   * @private
   * @param s {Number} new pin state set
   * @param tick {Number}
   */
  yasp.Pin.prototype.updatePwm = function (s, tick) {
    if(s === 1) {
      if(this.pwmStatus.startOn === null) {
        this.pwmStatus.startOn = tick;
        this.pwmStatus.startOff = null;
      } else if(this.pwmStatus.startOff !== null) {
        var status = this.pwmStatus;
        var timeOn = status.startOff - status.startOn;
        var timeOff = tick - status.startOff;
        var timeTotal = timeOn + timeOff;
        var percentOn = timeOn / timeTotal;

        this.setState(percentOn, true, tick);
      }
    } else if(s === 0 && this.pwmStatus.startOn !== null) {
      this.pwmStatus.startOff = tick;
    }

    this.pwmStatus.state = s;
    this.pwmStatus.tick = tick;

    this.clearPwmTimeout();
    this.pwmTimeout = setTimeout(this.pwmTimeoutFunc, 100);
  };

  /** updates the pin state. If PWM is enabled and ignorePwm is not false
   * @param state {Number} state (0 or 1) to set
   * @param ignorePwm {Boolean} true if all PWM code should be skipped and the PWM status reset
   * @param tick {Number}
   */
  yasp.Pin.prototype.setState = function (state, ignorePwm, tick) {
    if(ignorePwm === false && this.pwm === true) {
      this.state = state;
      this.updatePwm(state, tick);
    } else {
      this.state = state;
      this.STATE_CHANGED(this, tick);
      this.resetPwm();
    }
  };
})();
